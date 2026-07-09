"use client";

import { FormEvent, useState } from "react";
import { setSession } from "@/lib/auth/session";
import { getProfile, saveProfile } from "@/lib/data/store";

export default function AuthPage() {
  const [username, setUsername] = useState("ercanulger");
  const [email, setEmail] = useState("player@pisti.game");
  const [message, setMessage] = useState<string | null>(null);

  const register = async (event: FormEvent) => {
    event.preventDefault();

    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Kayıt başarısız");
      return;
    }

    setSession({ username, email });
    const profile = getProfile();
    saveProfile({ ...profile, username, email, isAdmin: username === "ercanulger" });
    setMessage("Doğrulama e-postası gönderildi ve oturum açıldı.");
  };

  return (
    <form onSubmit={register} className="mx-auto max-w-md space-y-4 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5">
      <h1 className="text-2xl">Kayıt / Giriş</h1>
      <label className="block text-sm">
        Kullanıcı Adı
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm">
        E-posta
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
          required
        />
      </label>
      <button className="w-full rounded-xl border border-cyan-300/50 bg-cyan-500/20 py-2">Doğrulama Gönder</button>
      {message && <p className="text-sm text-zinc-300">{message}</p>}
    </form>
  );
}
