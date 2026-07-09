import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.target || typeof body?.coin !== "number") {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, target: body.target, amount: body.coin });
}
