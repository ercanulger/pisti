import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email as string | undefined;

  if (!email) {
    return NextResponse.json({ error: "E-posta zorunlu" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: true, simulated: true });
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "pisti.game <onboarding@resend.dev>",
    to: email,
    subject: "pisti.game şifre sıfırlama",
    html: "<p>Şifre sıfırlama talebiniz alınmıştır.</p>",
  });

  return NextResponse.json({ ok: true });
}
