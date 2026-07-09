import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = body?.email as string | undefined;
  const username = body?.username as string | undefined;

  if (!email || !username) {
    return NextResponse.json({ error: "Geçersiz kayıt bilgisi" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: true, simulated: true, message: "RESEND_API_KEY tanımlı değil" });
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: "pisti.game <onboarding@resend.dev>",
    to: email,
    subject: "pisti.game doğrulama",
    html: `<p>Merhaba ${username}, hesabın doğrulandı.</p>`,
  });

  return NextResponse.json({ ok: true });
}
