import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const FEED_KEY = "pisti:live-feed";

export async function GET() {
  try {
    const list = (await kv.get<{ id: string; text: string; createdAt: number }[]>(FEED_KEY)) ?? [];
    return NextResponse.json({ items: list });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.text) {
    return NextResponse.json({ error: "text zorunlu" }, { status: 400 });
  }

  try {
    const current = (await kv.get<{ id: string; text: string; createdAt: number }[]>(FEED_KEY)) ?? [];
    const next = [{ id: crypto.randomUUID(), text: String(body.text), createdAt: Date.now() }, ...current].slice(0, 30);
    await kv.set(FEED_KEY, next);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true, simulated: true });
  }
}
