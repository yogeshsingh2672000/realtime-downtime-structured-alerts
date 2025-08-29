import { NextResponse, NextRequest } from "next/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // TODO: Implement actual model deletion logic
  return NextResponse.json({ ok: true });
}
