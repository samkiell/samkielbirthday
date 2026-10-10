import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAnalytics, getLiveStats, RANGE_KEYS, RangeKey } from "@/lib/analytics-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  if (url.searchParams.get("live") === "true") {
    const live = await getLiveStats();
    return NextResponse.json(live);
  }

  const r = url.searchParams.get("range") as RangeKey;
  const range: RangeKey = RANGE_KEYS.includes(r) ? r : "24h";
  return NextResponse.json(await getAnalytics(range));
}
