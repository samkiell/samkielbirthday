import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { deleteWish, updateWishStatus } from "@/lib/wishes-service";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();
  const { status } = body;

  if (!["approved", "pending", "hidden"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const success = await updateWishStatus(id, status);
  if (!success) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, id, status });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const success = await deleteWish(id);
  if (!success) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, id });
}
