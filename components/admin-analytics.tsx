"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { AnalyticsReport, LiveStatsReport, RangeKey } from "@/lib/analytics-service";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1h", label: "Last hour" },
  { key: "6h", label: "6 hours" },
  { key: "24h", label: "24 hours" },
  { key: "launch", label: "Since Oct 11" },
];

const TZ = "Africa/Lagos";
const fmtTime = (t: number, withMinutes: boolean) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: withMinutes ? "2-digit" : undefined,
    hour12: false,
  }).format(t);
const dur = (s: number) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);

function Stat({
  label,
  value,
  hint,
  isLive,
}: {
  label: string;
  value: string | number;
  hint?: string;
  isLive?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-1 relative overflow-hidden">
      <div className="flex items-center gap-1.5">
        {isLive && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted">{label}</p>
      </div>
      <p className="font-serif text-2xl text-ink">{value}</p>
      {hint && <p className="text-[11px] font-mono text-muted">{hint}</p>}
    </div>
  );
}

function BarList({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs font-mono text-muted">No data yet</p>
      ) : (
        rows.map((r) => (
          <div key={r.name} className="space-y-1">
            <div className="flex justify-between text-xs text-ink">
              <span className="truncate pr-2">{r.name}</span>
              <span className="font-mono text-muted">{r.count}</span>
            </div>
            <div className="h-1 rounded-full bg-hairline">
              <div className="h-1 rounded-full bg-accent" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const [range, setRange] = useState<RangeKey>("24h");
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStatsReport | null>(null);
  const [tick, setTick] = useState(0);

  // Full analytics report (30s polling or on range/tick change)
  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: "no-store" });
        if (res.ok && alive) setData(await res.json());
      } catch {}
    };
    run();
    const id = setInterval(run, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [range, tick]);

  // Realtime Live Now polling (every 3 seconds)
  useEffect(() => {
    let alive = true;
    const fetchLive = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/admin/analytics?live=true", { cache: "no-store" });
        if (res.ok && alive) {
          const live = await res.json();
          setLiveStats(live);
        }
      } catch {}
    };

    fetchLive();
    const id = setInterval(fetchLive, 3000);

    const onVisibilityChange = () => {
      if (!document.hidden) fetchLive();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const maxViews = Math.max(1, ...(data?.timeline.map((b) => b.views) || [1]));
  const withMinutes = data ? data.bucketMs < 3600e3 : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setData(null);
                setRange(r.key);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                range === r.key ? "bg-accent text-paper font-semibold" : "text-muted hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live: {liveStats?.liveNow ?? data?.totals.liveNow ?? 0}</span>
          </div>

          <button
            onClick={() => setTick((t) => t + 1)}
            className="p-2 rounded-lg border border-hairline text-muted hover:text-ink cursor-pointer"
            title="Refresh full report"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!data ? (
        <p className="py-12 text-center text-xs font-mono text-muted">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat
              label="Live now"
              value={liveStats ? liveStats.liveNow : data.totals.liveNow}
              hint={liveStats ? "realtime · 3s polling" : "active in last 3 min"}
              isLive
            />
            <Stat label="Visitors" value={data.totals.visitors} hint={`${data.totals.sessions} sessions`} />
            <Stat label="Page views" value={data.totals.pageviews} hint={`${data.totals.pagesPerSession} per session`} />
            <Stat label="Avg time" value={dur(data.totals.avgSeconds)} hint={`median ${dur(data.totals.medianSeconds)}`} />
            <Stat label="Bounce rate" value={`${data.totals.bounceRate}%`} />
            <Stat label="Letter conversion" value={`${data.totals.lettersConversion}%`} hint="visitors who left a letter" />
            <Stat
              label="Peak"
              value={data.peak ? fmtTime(data.peak.t, withMinutes) : "n/a"}
              hint={data.peak ? `${data.peak.views} views` : undefined}
            />
            <Stat label="Window" value={dur(Math.round((data.to - data.from) / 1000))} hint="data kept 3 days max" />
          </div>

          <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Traffic over time (WAT)
            </p>
            <div className="flex items-end gap-1 h-32">
              {data.timeline.map((b) => (
                <div key={b.t} className="flex-1 flex flex-col justify-end h-full" title={`${fmtTime(b.t, withMinutes)}: ${b.views} views, ${b.visitors} visitors`}>
                  <div className="w-full bg-accent rounded-sm" style={{ height: `${(b.views / maxViews) * 100}%`, minHeight: b.views ? 2 : 0 }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted">
              <span>{fmtTime(data.timeline[0].t, withMinutes)}</span>
              <span>{fmtTime(data.timeline[data.timeline.length - 1].t, withMinutes)}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted">Chapter reach</p>
              {data.funnel.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs text-ink">
                    <span>{c.label}</span>
                    <span className="font-mono text-muted">{c.pct}% ({c.reached})</span>
                  </div>
                  <div className="h-1 rounded-full bg-hairline">
                    <div className="h-1 rounded-full bg-accent" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <BarList
              title="Scroll depth (sessions)"
              rows={data.depth.map((d) => ({ name: `${d.depth}%`, count: d.sessions }))}
            />
            <BarList title="Actions" rows={data.actions} />
            <BarList title="Pages" rows={data.pages} />
            <BarList title="Referrers" rows={data.referrers} />
            <BarList title="Countries" rows={data.countries} />
            <BarList title="Cities" rows={data.cities} />
            <BarList title="Devices" rows={data.devices} />
            <BarList title="Browsers" rows={data.browsers} />
            <BarList title="Operating systems" rows={data.systems} />
          </div>

          <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted">Recent activity</p>
              {liveStats && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Live stream</span>
                </span>
              )}
            </div>
            {((liveStats?.recent && liveStats.recent.length > 0 ? liveStats.recent : data.recent).length === 0) ? (
              <p className="text-xs font-mono text-muted">Nothing yet</p>
            ) : (
              (liveStats?.recent && liveStats.recent.length > 0 ? liveStats.recent : data.recent).map((e, i) => (
                <div key={i} className="flex justify-between gap-3 text-xs text-ink border-t border-hairline pt-2 first:border-0 first:pt-0">
                  <span className="truncate">
                    {e.type === "click" ? e.label : e.type === "chapter" ? `reached ${e.chapter}` : e.type.replace("_", " ")} · {e.path}
                  </span>
                  <span className="font-mono text-muted whitespace-nowrap">
                    {[e.city, e.country, e.device].filter(Boolean).join(", ")} · {fmtTime(e.ts, true)}
                  </span>
                </div>
              ))
            )}
          </div>
          <p className="text-[11px] font-mono text-muted">
            Privacy: no raw IPs stored, visitor ids rotate daily, Do Not Track is respected, events auto-delete after 3 days.
          </p>
        </>
      )}
    </div>
  );
}
