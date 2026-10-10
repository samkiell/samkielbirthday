import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, recordEvent, visitorId } from "@/lib/analytics-service";

const schema = z.object({
  type: z.enum(["pageview", "ping", "chapter", "scroll", "click"]),
  sid: z.string().min(8).max(64),
  path: z.string().max(200).startsWith("/"),
  ref: z.string().max(120).optional(),
  chapter: z.string().regex(/^chapter-0[1-5]$/).optional(),
  depth: z.number().int().min(0).max(100).optional(),
  label: z.string().regex(/^[a-z0-9_:.\-]{1,60}$/i).optional(),
});

// Best-effort flood guard (per serverless instance).
const hits = new Map<string, number[]>();
function allowed(vid: string) {
  const now = Date.now();
  const recent = (hits.get(vid) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 120) return false;
  recent.push(now);
  hits.set(vid, recent);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("dnt") === "1") return new NextResponse(null, { status: 204 });
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return new NextResponse(null, { status: 204 });

    const vid = visitorId(getClientIp(req.headers), req.headers.get("user-agent") || "");
    if (!allowed(vid)) return new NextResponse(null, { status: 204 });

    await recordEvent(parsed.data, req.headers);
  } catch {
    // analytics must never break the site
  }
  return new NextResponse(null, { status: 204 });
}
