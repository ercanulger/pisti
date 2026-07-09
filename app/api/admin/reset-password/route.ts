import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.admin) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action: "password_reset", target: body.email });
}
