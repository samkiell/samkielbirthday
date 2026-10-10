"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Activity,
  Radio,
  BarChart3,
  Eye,
  MousePointer,
  BookOpen,
  FileDown,
  Globe,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Filter,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  AnalyticsReport,
  LiveStatsReport,
  PaginatedEventsResponse,
  DetailedEventItem,
  RangeKey,
  EventType,
} from "@/lib/analytics-service";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "1h", label: "Last hour" },
  { key: "6h", label: "6 hours" },
  { key: "24h", label: "24 hours" },
  { key: "launch", label: "Since Oct 11" },
];

const STREAM_FILTER_TYPES: { key: string; label: string; icon: any }[] = [
  { key: "all", label: "All Events", icon: Activity },
  { key: "pageview", label: "Pageviews", icon: Eye },
  { key: "wish_submit", label: "Wishes", icon: Sparkles },
  { key: "click", label: "Actions & Shares", icon: MousePointer },
  { key: "chapter", label: "Chapters", icon: BookOpen },
  { key: "pdf_download", label: "PDF Downloads", icon: FileDown },
];

const TZ = "Africa/Lagos";

const fmtTime = (t: number, withMinutes: boolean) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: withMinutes ? "2-digit" : undefined,
    hour12: false,
  }).format(t);

const fmtTimeWithSeconds = (t: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(t);

const timeAgo = (ts: number): string => {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
};

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
              <div
                className="h-1 rounded-full bg-accent"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function getEventBadge(type: EventType) {
  switch (type) {
    case "wish_submit":
      return {
        label: "Wish",
        icon: Sparkles,
        className:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    case "pageview":
      return {
        label: "Pageview",
        icon: Eye,
        className:
          "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
      };
    case "click":
      return {
        label: "Action",
        icon: MousePointer,
        className:
          "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
      };
    case "chapter":
      return {
        label: "Chapter",
        icon: BookOpen,
        className:
          "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      };
    case "pdf_download":
      return {
        label: "PDF Export",
        icon: FileDown,
        className:
          "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      };
    default:
      return {
        label: type,
        icon: Activity,
        className:
          "bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30",
      };
  }
}

function getDeviceIcon(device: string) {
  if (device === "Mobile") return Smartphone;
  return Monitor;
}

export function AdminAnalytics() {
  // Navigation mode: "stream" (Elaborated Live Stream) vs "overview" (Metrics & Charts)
  const [activeTab, setActiveTab] = useState<"stream" | "overview">("stream");

  // Overview metrics state
  const [range, setRange] = useState<RangeKey>("24h");
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStatsReport | null>(null);
  const [tick, setTick] = useState(0);

  // Elaborated Live Stream state
  const [streamData, setStreamData] = useState<PaginatedEventsResponse | null>(null);
  const [streamPage, setStreamPage] = useState(1);
  const [streamLimit, setStreamLimit] = useState(25);
  const [streamType, setStreamType] = useState<string>("all");
  const [streamSearch, setStreamSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [streamLoading, setStreamLoading] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Fetch full overview report (30s polling or on range/tick change)
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

  // Realtime Live Now visitor count ping (every 3 seconds)
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

  // Fetch paginated elaborated live stream events
  const fetchStream = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setStreamLoading(true);
      try {
        const params = new URLSearchParams({
          stream: "true",
          page: streamPage.toString(),
          limit: streamLimit.toString(),
        });
        if (streamType && streamType !== "all") params.set("type", streamType);
        if (streamSearch.trim()) params.set("search", streamSearch.trim());

        const res = await fetch(`/api/admin/analytics?${params.toString()}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          setStreamData(json);
        }
      } catch (err) {
        console.error("Failed to load stream:", err);
      } finally {
        if (!isBackground) setStreamLoading(false);
      }
    },
    [streamPage, streamLimit, streamType, streamSearch]
  );

  // Effect to load stream whenever filters or page changes
  useEffect(() => {
    fetchStream(false);
  }, [fetchStream]);

  // Background auto-refresh for live stream (every 3.5 seconds when on page 1)
  useEffect(() => {
    if (!autoRefresh || streamPage !== 1 || streamSearch.trim() !== "") return;

    let alive = true;
    const id = setInterval(() => {
      if (document.hidden) return;
      if (alive) fetchStream(true);
    }, 3500);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [autoRefresh, streamPage, streamSearch, fetchStream]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStreamSearch(searchInput);
    setStreamPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setStreamSearch("");
    setStreamPage(1);
  };

  const filterBySession = (sid: string) => {
    setSearchInput(sid);
    setStreamSearch(sid);
    setStreamPage(1);
  };

  const liveVisitorsCount =
    streamData?.liveNow ?? liveStats?.liveNow ?? data?.totals.liveNow ?? 0;

  const maxViews = Math.max(1, ...(data?.timeline.map((b) => b.views) || [1]));
  const withMinutes = data ? data.bucketMs < 3600e3 : false;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Main Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline pb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Stream vs Overview Tab Pills */}
          <button
            type="button"
            onClick={() => setActiveTab("stream")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "stream"
                ? "bg-accent text-paper font-semibold shadow-2xs"
                : "border border-hairline bg-paper/60 text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>Live Stream</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 dark:bg-white/20">
              {liveVisitorsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-accent text-paper font-semibold shadow-2xs"
                : "border border-hairline bg-paper/60 text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Overview</span>
          </button>
        </div>

        {/* Global Live Pulse indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold">{liveVisitorsCount}</span>
            <span className="text-[11px] text-muted">active online</span>
          </div>

          <button
            onClick={() => {
              if (activeTab === "stream") fetchStream(false);
              else setTick((t) => t + 1);
            }}
            className="p-2 rounded-lg border border-hairline text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${streamLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ELABORATED LIVE STREAM CONSOLE                                    */}
      {/* ========================================================================= */}
      {activeTab === "stream" && (
        <div className="space-y-4 sm:space-y-5">
          {/* Stream Header & Filter Controls Bar */}
          <div className="p-3.5 sm:p-5 rounded-2xl border border-hairline bg-paper/80 backdrop-blur-xs space-y-3.5 sm:space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-serif text-lg text-ink font-medium">
                  elaborated live event stream
                </h3>
                <p className="text-[11px] font-mono text-muted">
                  real-time activity feed · all visitor paths, clicks, and interactions
                </p>
              </div>

              {/* Stream Settings: Auto-refresh & Rows */}
              <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    autoRefresh
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-hairline text-muted hover:text-ink"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-muted"
                    }`}
                  />
                  <span>auto: {autoRefresh ? "on (3s)" : "paused"}</span>
                </button>

                <div className="flex items-center gap-1 pl-2 border-l border-hairline text-muted">
                  <span className="text-[10px] uppercase">rows:</span>
                  {[15, 25, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setStreamLimit(num);
                        setStreamPage(1);
                      }}
                      className={`px-1.5 sm:px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                        streamLimit === num
                          ? "bg-accent text-paper font-semibold"
                          : "hover:text-ink"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Pills with horizontal swipe on mobile */}
            <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 sm:flex-wrap">
              {STREAM_FILTER_TYPES.map((f) => {
                const Icon = f.icon;
                const isSelected = streamType === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setStreamType(f.key);
                      setStreamPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? "bg-ink text-paper font-medium shadow-2xs"
                        : "border border-hairline bg-paper/60 text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="search by path, action, city, browser, sid..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-hairline bg-paper text-ink text-xs font-mono placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent text-paper text-xs font-mono font-medium hover:bg-accent/90 transition-colors cursor-pointer shrink-0 text-center"
              >
                filter stream
              </button>
            </form>

            {/* Active search tag banner */}
            {streamSearch && (
              <div className="flex items-center justify-between text-xs font-mono text-muted bg-paper/40 px-3 py-1.5 rounded-lg border border-hairline">
                <span className="truncate pr-2">
                  Filtering for: <strong className="text-ink">&quot;{streamSearch}&quot;</strong>
                </span>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-accent hover:underline cursor-pointer shrink-0"
                >
                  clear
                </button>
              </div>
            )}
          </div>

          {/* Stream Events Table / Feed */}
          <div className="rounded-2xl border border-hairline bg-paper/80 backdrop-blur-xs overflow-hidden shadow-xs">
            {/* Table Header Summary */}
            <div className="p-3.5 sm:px-5 border-b border-hairline bg-paper/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted">
              <div>
                {streamData ? (
                  <span>
                    Showing <strong className="text-ink">{streamData.events.length}</strong> of{" "}
                    <strong className="text-ink">{streamData.total}</strong> events · page{" "}
                    <strong className="text-ink">{streamData.page}</strong> of{" "}
                    <strong className="text-ink">{streamData.totalPages}</strong>
                  </span>
                ) : (
                  <span>connecting to live stream...</span>
                )}
              </div>

              {streamPage > 1 && autoRefresh && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  (auto-stream paused on page {streamPage}; click page 1 to resume live updates)
                </span>
              )}
            </div>

            {/* Events List */}
            {streamLoading && !streamData ? (
              <div className="py-16 text-center text-xs font-mono text-muted space-y-2">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto text-accent" />
                <p>loading event stream...</p>
              </div>
            ) : !streamData || streamData.events.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-muted space-y-2">
                <Activity className="w-5 h-5 mx-auto opacity-40" />
                <p>no analytics events found for this filter</p>
                {streamSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-accent underline cursor-pointer pt-2 block mx-auto"
                  >
                    clear search query
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-hairline">
                {streamData.events.map((e) => {
                  const badge = getEventBadge(e.type);
                  const Icon = badge.icon;
                  const DeviceIcon = getDeviceIcon(e.device);
                  const isExpanded = expandedEventId === e.id;

                  return (
                    <div
                      key={e.id}
                      className="group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    >
                      {/* Main Summary Row */}
                      <div
                        onClick={() =>
                          setExpandedEventId(isExpanded ? null : e.id)
                        }
                        className="p-3 sm:p-4 sm:px-5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 cursor-pointer"
                      >
                        {/* Left: Timestamp, Badge, and Action Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          {/* Time & Badge sub-row on mobile */}
                          <div className="flex items-center justify-between sm:justify-start gap-2.5 shrink-0">
                            <div className="flex items-baseline gap-1.5 sm:block sm:w-20 shrink-0 text-left">
                              <span className="font-mono text-xs text-ink font-medium">
                                {fmtTimeWithSeconds(e.ts)}
                              </span>
                              <span className="font-mono text-[10px] text-muted">
                                {timeAgo(e.ts)}
                              </span>
                            </div>

                            {/* Event Type Badge */}
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono border shrink-0 ${badge.className}`}
                            >
                              <Icon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          {/* Event Action / Target Description */}
                          <div className="min-w-0 flex-1 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {e.label && (
                                <span className="font-medium text-ink break-words">
                                  {e.label}
                                </span>
                              )}
                              {e.chapter && (
                                <span className="font-medium text-ink">
                                  reached {e.chapter}
                                </span>
                              )}
                              <span className="font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-hairline/80 text-muted break-all max-w-full">
                                {e.path}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Client, Geo, Session Metadata */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-muted justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-hairline/40">
                          {/* Location */}
                          {(e.city || e.country) && (
                            <span className="inline-flex items-center gap-1 truncate max-w-[130px] sm:max-w-[160px]">
                              <Globe className="w-3 h-3 text-accent shrink-0" />
                              <span className="truncate">
                                {[e.city, e.country].filter(Boolean).join(", ")}
                              </span>
                            </span>
                          )}

                          {/* Device / Client */}
                          <span className="inline-flex items-center gap-1">
                            <DeviceIcon className="w-3 h-3 shrink-0" />
                            <span>
                              {e.device} · {e.browser}
                            </span>
                          </span>

                          {/* Session Tag */}
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              filterBySession(e.sid);
                            }}
                            title={`Filter stream by session ${e.sid}`}
                            className="px-1.5 py-0.5 rounded text-[10px] border border-hairline bg-paper hover:border-accent hover:text-ink transition-colors cursor-pointer shrink-0"
                          >
                            sid:{e.sid.slice(0, 6)}…
                          </button>

                          {/* Expand chevron */}
                          <ChevronRight
                            className={`w-3.5 h-3.5 text-muted transition-transform duration-200 hidden sm:inline-block ${
                              isExpanded ? "rotate-90 text-accent" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expandable Detailed Metadata Tray */}
                      {isExpanded && (
                        <div className="px-3.5 sm:px-5 py-3.5 sm:py-4 bg-black/[0.03] dark:bg-white/[0.03] border-t border-hairline text-xs font-mono space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                              detailed event inspector
                            </span>
                            <span className="text-[10px] text-muted">
                              ISO: {new Date(e.ts).toISOString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 text-[11px]">
                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                route path
                              </span>
                              <span className="text-ink break-all font-medium">{e.path}</span>
                            </div>

                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                session id
                              </span>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-ink break-all">{e.sid}</span>
                                <button
                                  type="button"
                                  onClick={() => filterBySession(e.sid)}
                                  className="text-accent hover:underline text-[10px] shrink-0"
                                >
                                  track session
                                </button>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                client & os
                              </span>
                              <span className="text-ink">
                                {e.device} · {e.browser} on {e.os}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                location
                              </span>
                              <span className="text-ink">
                                {[e.city, e.country].filter(Boolean).join(", ") || "Unknown"}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                referrer
                              </span>
                              <span className="text-ink break-all">
                                {e.ref || "Direct (None)"}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg border border-hairline bg-paper space-y-1">
                              <span className="text-muted block text-[10px] uppercase">
                                label / payload
                              </span>
                              <span className="text-ink break-all">
                                {e.label || (e.chapter ? `chapter: ${e.chapter}` : "None")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls Bar */}
            {streamData && streamData.totalPages > 1 && (
              <div className="p-3 sm:p-4 border-t border-hairline bg-paper/90 flex items-center justify-between gap-2 text-xs font-mono">
                {/* Previous Button */}
                <button
                  type="button"
                  disabled={streamPage <= 1 || streamLoading}
                  onClick={() => setStreamPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-hairline bg-paper text-ink hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">previous page</span>
                  <span className="sm:hidden">prev</span>
                </button>

                {/* Mobile Page Indicator */}
                <div className="sm:hidden text-[11px] text-muted font-medium text-center truncate">
                  page <strong className="text-ink">{streamPage}</strong> / {streamData.totalPages}
                </div>

                {/* Desktop Page Number Pills */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(7, streamData.totalPages) },
                    (_, i) => {
                      let pageNum = i + 1;
                      if (streamData.totalPages > 7) {
                        const start = Math.max(
                          1,
                          Math.min(streamPage - 3, streamData.totalPages - 6)
                        );
                        pageNum = start + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setStreamPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            streamPage === pageNum
                              ? "bg-accent text-paper font-semibold shadow-2xs"
                              : "border border-hairline hover:border-ink text-muted hover:text-ink"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  disabled={
                    streamPage >= streamData.totalPages || streamLoading
                  }
                  onClick={() =>
                    setStreamPage((p) =>
                      Math.min(streamData.totalPages, p + 1)
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-hairline bg-paper text-ink hover:border-ink hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                >
                  <span className="hidden sm:inline">next page</span>
                  <span className="sm:hidden">next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: OVERVIEW & PERFORMANCE METRICS                                    */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
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
                    range === r.key
                      ? "bg-accent text-paper font-semibold"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab("stream")}
              className="text-xs font-mono text-accent hover:underline inline-flex items-center gap-1"
            >
              <span>open live stream console →</span>
            </button>
          </div>

          {!data ? (
            <p className="py-12 text-center text-xs font-mono text-muted">
              Loading analytics...
            </p>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat
                  label="Live now"
                  value={liveVisitorsCount}
                  hint="active in last 3 min"
                  isLive
                />
                <Stat
                  label="Visitors"
                  value={data.totals.visitors}
                  hint={`${data.totals.sessions} sessions`}
                />
                <Stat
                  label="Page views"
                  value={data.totals.pageviews}
                  hint={`${data.totals.pagesPerSession} per session`}
                />
                <Stat
                  label="Avg time"
                  value={dur(data.totals.avgSeconds)}
                  hint={`median ${dur(data.totals.medianSeconds)}`}
                />
                <Stat label="Bounce rate" value={`${data.totals.bounceRate}%`} />
                <Stat
                  label="Letter conversion"
                  value={`${data.totals.lettersConversion}%`}
                  hint="visitors who left a letter"
                />
                <Stat
                  label="Peak"
                  value={data.peak ? fmtTime(data.peak.t, withMinutes) : "n/a"}
                  hint={data.peak ? `${data.peak.views} views` : undefined}
                />
                <Stat
                  label="Window"
                  value={dur(Math.round((data.to - data.from) / 1000))}
                  hint="data kept 3 days max"
                />
              </div>

              {/* Traffic Chart */}
              <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                  Traffic over time (WAT)
                </p>
                <div className="flex items-end gap-1 h-32">
                  {data.timeline.map((b) => (
                    <div
                      key={b.t}
                      className="flex-1 flex flex-col justify-end h-full"
                      title={`${fmtTime(b.t, withMinutes)}: ${b.views} views, ${
                        b.visitors
                      } visitors`}
                    >
                      <div
                        className="w-full bg-accent rounded-sm"
                        style={{
                          height: `${(b.views / maxViews) * 100}%`,
                          minHeight: b.views ? 2 : 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>{fmtTime(data.timeline[0].t, withMinutes)}</span>
                  <span>
                    {fmtTime(
                      data.timeline[data.timeline.length - 1].t,
                      withMinutes
                    )}
                  </span>
                </div>
              </div>

              {/* Funnel & Bar Lists */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-hairline bg-paper/70 space-y-3">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                    Chapter reach
                  </p>
                  {data.funnel.map((c) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between text-xs text-ink">
                        <span>{c.label}</span>
                        <span className="font-mono text-muted">
                          {c.pct}% ({c.reached})
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-hairline">
                        <div
                          className="h-1 rounded-full bg-accent"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <BarList
                  title="Scroll depth (sessions)"
                  rows={data.depth.map((d) => ({
                    name: `${d.depth}%`,
                    count: d.sessions,
                  }))}
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

              {/* Callout to open full stream */}
              <div className="p-4 rounded-xl border border-hairline bg-paper/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <span className="text-muted">
                  Looking for full paginated event logs and real-time inspector?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("stream")}
                  className="px-4 py-2 rounded-lg bg-accent text-paper font-medium hover:bg-accent/90 transition-colors cursor-pointer"
                >
                  open elaborated live stream ({liveVisitorsCount} live) →
                </button>
              </div>

              <p className="text-[11px] font-mono text-muted">
                Privacy: no raw IPs stored, visitor ids rotate daily, Do Not Track is
                respected, events auto-delete after 3 days.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
