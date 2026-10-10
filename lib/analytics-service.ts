import crypto from "crypto";
import { headers } from "next/headers";
import { getDb } from "./mongodb";

// Oct 11, 2026 00:00 in Nigeria (WAT, UTC+1)
export const LAUNCH_START = new Date("2026-10-10T23:00:00Z");
export const CHAPTERS = [
  { id: "chapter-01", label: "Opening" },
  { id: "chapter-02", label: "Story" },
  { id: "chapter-03", label: "Learning" },
  { id: "chapter-04", label: "Letters" },
  { id: "chapter-05", label: "Manifesto" },
];

// Deliberately short windows: the site is only busy for about a day.
export const RANGE_KEYS = ["1h", "6h", "24h", "launch"] as const;
export type RangeKey = (typeof RANGE_KEYS)[number];
const RANGE_MS: Record<Exclude<RangeKey, "launch">, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
};

export type EventType =
  | "pageview"
  | "ping"
  | "chapter"
  | "scroll"
  | "click"
  | "wish_submit"
  | "pdf_download";

export interface AnalyticsEvent {
  ts: Date;
  type: EventType;
  sid: string;
  vid: string;
  path: string;
  ref?: string;
  country?: string;
  city?: string;
  device: string;
  browser: string;
  os: string;
  chapter?: string;
  depth?: number;
  label?: string;
}

type HeaderReader = { get(name: string): string | null };

const memory: AnalyticsEvent[] = [];
let indexesReady: Promise<void> | null = null;

async function getCollection() {
  const db = await getDb();
  if (!db) return null;
  const c = db.collection<AnalyticsEvent>("analytics_events");
  if (!indexesReady) {
    indexesReady = Promise.all([
      // Events delete themselves after 3 days. Nothing is kept long term.
      c.createIndex({ ts: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 }),
      c.createIndex({ sid: 1, ts: 1 }),
    ])
      .then(() => undefined)
      .catch(() => undefined);
  }
  await indexesReady;
  return c;
}

export function parseUA(ua: string) {
  const l = ua.toLowerCase();
  const device = /ipad|tablet/.test(l)
    ? "Tablet"
    : /mobi|android|iphone/.test(l)
      ? "Mobile"
      : "Desktop";
  const browser = /edg\//.test(l)
    ? "Edge"
    : /opr\/|opera/.test(l)
      ? "Opera"
      : /samsungbrowser/.test(l)
        ? "Samsung Internet"
        : /firefox|fxios/.test(l)
          ? "Firefox"
          : /chrome|crios/.test(l)
            ? "Chrome"
            : /safari/.test(l)
              ? "Safari"
              : "Other";
  const os = /android/.test(l)
    ? "Android"
    : /iphone|ipad|ios/.test(l)
      ? "iOS"
      : /windows/.test(l)
        ? "Windows"
        : /mac os/.test(l)
          ? "macOS"
          : /linux/.test(l)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

export function isBot(ua: string) {
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|vercel/i.test(
    ua
  );
}

export function getClientIp(h: HeaderReader) {
  const f = h.get("x-forwarded-for");
  return f ? f.split(",")[0].trim() : "127.0.0.1";
}

// Visitor id: hash of ip + user agent + today's date. Rotates daily, raw IP is never stored.
export function visitorId(ip: string, ua: string) {
  const day = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  });
  const salt = process.env.IP_HASH_SALT || "dev-salt";
  return crypto
    .createHash("sha256")
    .update(ip + ua + day + salt)
    .digest("hex")
    .slice(0, 16);
}

export interface TrackInput {
  type: EventType;
  sid: string;
  path: string;
  ref?: string;
  chapter?: string;
  depth?: number;
  label?: string;
}

export async function recordEvent(input: TrackInput, h: HeaderReader) {
  const ua = h.get("user-agent") || "";
  if (isBot(ua)) return;
  const ip = getClientIp(h);
  const city = h.get("x-vercel-ip-city");
  const doc: AnalyticsEvent = {
    ts: new Date(),
    type: input.type,
    sid: input.sid,
    vid: visitorId(ip, ua),
    path: input.path,
    ref: input.ref || undefined,
    country: h.get("x-vercel-ip-country") || undefined,
    city: city ? decodeURIComponent(city) : undefined,
    ...parseUA(ua),
    chapter: input.chapter,
    depth: input.depth,
    label: input.label,
  };
  try {
    const c = await getCollection();
    if (c) {
      await c.insertOne(doc);
      return;
    }
  } catch (err) {
    console.error("analytics insert error:", err);
  }
  memory.push(doc);
  if (memory.length > 20000) memory.splice(0, memory.length - 20000);
}

// For events fired by our own API routes (wish submitted, pdf downloaded).
export async function recordServerEvent(type: EventType, label?: string) {
  try {
    const h = await headers();
    const ua = h.get("user-agent") || "";
    const vid = visitorId(getClientIp(h), ua);
    await recordEvent({ type, sid: `srv-${vid}`, path: "/", label }, h);
  } catch (err) {
    console.error("analytics server event error:", err);
  }
}

async function fetchEvents(since: Date): Promise<AnalyticsEvent[]> {
  try {
    const c = await getCollection();
    if (c) {
      return await c
        .find({ ts: { $gte: since } }, { projection: { _id: 0 } })
        .sort({ ts: 1 })
        .limit(50000)
        .toArray();
    }
  } catch (err) {
    console.error("analytics query error:", err);
  }
  return memory.filter((e) => e.ts >= since);
}

function tally(map: Map<string, number>, key: string | undefined, fallback = "Unknown") {
  const k = key || fallback;
  map.set(k, (map.get(k) || 0) + 1);
}
function top(map: Map<string, number>, n = 8) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

export async function getAnalytics(range: RangeKey) {
  const now = Date.now();
  let start = range === "launch" ? LAUNCH_START.getTime() : now - RANGE_MS[range];
  if (range === "launch" && start > now) start = now - RANGE_MS["24h"];
  const bucketMs = range === "1h" ? 5 * 60e3 : range === "6h" ? 30 * 60e3 : 60 * 60e3;

  const events = await fetchEvents(new Date(start));

  // Timeline buckets
  const first = Math.floor(start / bucketMs) * bucketMs;
  const count = Math.min(72, Math.ceil((now - first) / bucketMs) || 1);
  const buckets = Array.from({ length: count }, (_, i) => ({
    t: first + i * bucketMs,
    views: 0,
    visitors: new Set<string>(),
  }));

  type Session = {
    first: number;
    last: number;
    pageviews: number;
    pings: number;
    chapters: Set<string>;
    maxDepth: number;
    actions: number;
    ref?: string;
    country?: string;
    city?: string;
    device: string;
    browser: string;
    os: string;
  };
  const sessions = new Map<string, Session>();
  const visitors = new Set<string>();
  const pages = new Map<string, number>();
  const actions = new Map<string, number>();
  const wishVisitors = new Set<string>();
  let pageviews = 0;
  const liveSince = now - 5 * 60e3;
  const liveSessions = new Set<string>();

  for (const e of events) {
    const ts = e.ts.getTime();
    const isServer = e.sid.startsWith("srv-");

    if (e.type === "wish_submit") {
      tally(actions, "Letters submitted");
      wishVisitors.add(e.vid);
      continue;
    }
    if (e.type === "pdf_download") {
      tally(actions, "Letters PDF downloaded");
      continue;
    }
    if (isServer) continue;

    if (ts >= liveSince) liveSessions.add(e.sid);

    let s = sessions.get(e.sid);
    if (!s) {
      s = {
        first: ts, last: ts, pageviews: 0, pings: 0, chapters: new Set(),
        maxDepth: 0, actions: 0, ref: undefined, country: e.country, city: e.city,
        device: e.device, browser: e.browser, os: e.os,
      };
      sessions.set(e.sid, s);
    }
    s.last = ts;

    switch (e.type) {
      case "pageview": {
        pageviews++;
        s.pageviews++;
        if (s.pageviews === 1) s.ref = e.ref;
        visitors.add(e.vid);
        tally(pages, e.path);
        const b = buckets[Math.min(buckets.length - 1, Math.max(0, Math.floor((ts - first) / bucketMs)))];
        b.views++;
        b.visitors.add(e.vid);
        break;
      }
      case "ping":
        s.pings++;
        break;
      case "chapter":
        if (e.chapter) s.chapters.add(e.chapter);
        break;
      case "scroll":
        s.maxDepth = Math.max(s.maxDepth, e.depth || 0);
        break;
      case "click": {
        s.actions++;
        const label = e.label || "click";
        const pretty: Record<string, string> = {
          begin: "Begin tapped",
          picture_download: "Picture downloaded",
          picture_share: "Picture shared",
          whatsapp_share: "WhatsApp share opened",
        };
        tally(actions, label.startsWith("outbound:") ? `Outbound: ${label.slice(9)}` : pretty[label] || label);
        break;
      }
    }
  }

  const sess = [...sessions.values()];
  const sessionCount = sess.length;
  const secs = sess.map((s) => s.pings * 15).sort((a, b) => a - b);
  const avgSeconds = sessionCount ? Math.round(secs.reduce((a, b) => a + b, 0) / sessionCount) : 0;
  const medianSeconds = sessionCount ? secs[Math.floor(sessionCount / 2)] : 0;
  const bounced = sess.filter(
    (s) => s.pageviews <= 1 && s.chapters.size <= 1 && s.actions === 0 && s.maxDepth < 50
  ).length;

  const device = new Map<string, number>();
  const browser = new Map<string, number>();
  const os = new Map<string, number>();
  const country = new Map<string, number>();
  const city = new Map<string, number>();
  const referrer = new Map<string, number>();
  for (const s of sess) {
    tally(device, s.device);
    tally(browser, s.browser);
    tally(os, s.os);
    tally(country, s.country);
    tally(city, s.city);
    tally(referrer, s.ref, "Direct");
  }

  const funnel = CHAPTERS.map((c) => {
    const reached = sess.filter((s) => s.chapters.has(c.id)).length;
    return { ...c, reached, pct: sessionCount ? Math.round((reached / sessionCount) * 100) : 0 };
  });
  const depth = [25, 50, 75, 100].map((d) => ({
    depth: d,
    sessions: sess.filter((s) => s.maxDepth >= d).length,
  }));

  const timeline = buckets.map((b) => ({ t: b.t, views: b.views, visitors: b.visitors.size }));
  const peak = timeline.reduce((m, b) => (b.views > m.views ? b : m), timeline[0]);

  const recent = events
    .filter((e) => !["ping", "scroll"].includes(e.type))
    .slice(-15)
    .reverse()
    .map((e) => ({
      ts: e.ts.getTime(), type: e.type, path: e.path, label: e.label, chapter: e.chapter,
      country: e.country, city: e.city, device: e.device,
    }));

  return {
    range,
    from: start,
    to: now,
    bucketMs,
    totals: {
      pageviews,
      visitors: visitors.size,
      sessions: sessionCount,
      liveNow: liveSessions.size,
      avgSeconds,
      medianSeconds,
      bounceRate: sessionCount ? Math.round((bounced / sessionCount) * 100) : 0,
      pagesPerSession: sessionCount ? Math.round((pageviews / sessionCount) * 10) / 10 : 0,
      lettersConversion: visitors.size ? Math.round((wishVisitors.size / visitors.size) * 1000) / 10 : 0,
    },
    timeline,
    peak: peak && peak.views > 0 ? { t: peak.t, views: peak.views } : null,
    funnel,
    depth,
    pages: top(pages),
    referrers: top(referrer),
    countries: top(country),
    cities: top(city),
    devices: top(device),
    browsers: top(browser),
    systems: top(os),
    actions: top(actions, 12),
    recent,
  };
}

export async function getLiveStats() {
  const now = Date.now();
  const liveSince = new Date(now - 3 * 60 * 1000);

  const c = await getCollection();
  let events: AnalyticsEvent[] = [];
  if (c) {
    try {
      events = await c
        .find({ ts: { $gte: liveSince } }, { projection: { _id: 0 } })
        .sort({ ts: -1 })
        .limit(200)
        .toArray();
    } catch (err) {
      console.error("live query error:", err);
      events = memory.filter((e) => e.ts >= liveSince);
    }
  } else {
    events = memory.filter((e) => e.ts >= liveSince);
  }

  const liveSessions = new Set<string>();
  for (const e of events) {
    if (!e.sid.startsWith("srv-")) {
      liveSessions.add(e.sid);
    }
  }

  const recent = events
    .filter((e) => !["ping", "scroll"].includes(e.type))
    .slice(0, 15)
    .map((e) => ({
      ts: e.ts.getTime(),
      type: e.type,
      path: e.path,
      label: e.label,
      chapter: e.chapter,
      country: e.country,
      city: e.city,
      device: e.device,
    }));

  return {
    liveNow: liveSessions.size,
    recent,
    ts: now,
  };
}

export type LiveStatsReport = Awaited<ReturnType<typeof getLiveStats>>;
export type AnalyticsReport = Awaited<ReturnType<typeof getAnalytics>>;
