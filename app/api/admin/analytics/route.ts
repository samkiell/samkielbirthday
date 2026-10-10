import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import {
  getAnalytics,
  getLiveStats,
  getPaginatedEvents,
  RANGE_KEYS,
  RangeKey,
} from "@/lib/analytics-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);

  // Paginated live stream query
  if (url.searchParams.get("stream") === "true" || url.searchParams.has("page")) {
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);
    const type = url.searchParams.get("type") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const result = await getPaginatedEvents({ page, limit, type, search });
    return NextResponse.json(result);
  }

  // Realtime Live Now ping
  if (url.searchParams.get("live") === "true") {
    const live = await getLiveStats();
    return NextResponse.json(live);
  }

  const r = url.searchParams.get("range") as RangeKey;
  const range: RangeKey = RANGE_KEYS.includes(r) ? r : "24h";
  return NextResponse.json(await getAnalytics(range));
}
