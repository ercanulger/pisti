"use client";

import { FormEvent, useMemo, useState } from "react";
import { addAudit, getAudit, getLeaderboard, getProfile, saveLeaderboard } from "@/lib/data/store";

export default function AdminPage() {
  const [user, setUser] = useState("admin");
  const [password, setPassword] = useState("admin58");
  const [authenticated, setAuthenticated] = useState(false);
  const [target, setTarget] = useState("ercanulger");
  const [coin, setCoin] = useState(100);
  const [info, setInfo] = useState<string | null>(null);

  const users = useMemo(() => getLeaderboard(), [authenticated, info]);
  const logs = useMemo(() => getAudit(), [authenticated, info]);

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (user === "admin" && password === "admin58") {
      setAuthenticated(true);
      setInfo("Admin oturumu açıldı.");
      return;
    }
    setInfo("Hatalı admin bilgisi.");
  };

  const assignCoin = async () => {
    const response = await fetch("/api/admin/coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, coin, admin: getProfile().username }),
    });

    if (!response.ok) {
      setInfo("Coin transferi başarısız.");
      return;
    }

    const board = getLeaderboard();
    const next = board.map((row) => (row.username === target ? { ...row, coins: row.coins + coin } : row));
    saveLeaderboard(next);
    addAudit({ type: "coin_transfer", admin: "admin", target, amount: coin });
    setInfo(`${target} kullanıcısına ${coin} coin tanımlandı.`);
  };

  const resetPassword = async () => {
    const response = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `${target}@pisti.game`, admin: "admin" }),
    });

    if (!response.ok) {
      setInfo("Şifre sıfırlama isteği başarısız.");
      return;
    }

    addAudit({ type: "password_reset", admin: "admin", target });
    setInfo(`${target} için şifre sıfırlama e-postası tetiklendi.`);
  };

  if (!authenticated) {
    return (
      <form onSubmit={login} className="mx-auto max-w-md space-y-4 rounded-3xl border border-cyan-400/20 bg-zinc-950 p-5">
        <h1 className="text-2xl">Admin Panel Giriş</h1>
        <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2" />
        <button className="w-full rounded-xl border border-cyan-300/50 bg-cyan-500/20 py-2">Giriş Yap</button>
        {info && <p className="text-sm text-zinc-400">{info}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Admin Dashboard</h1>
      <section className="cyber-card rounded-3xl p-4">
        <h2 className="text-sm text-cyan-300">Kullanıcı İşlemleri</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto_auto]">
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2">
            {users.map((row) => (
              <option key={row.username}>{row.username}</option>
            ))}
          </select>
          <input
            type="number"
            value={coin}
            onChange={(e) => setCoin(Number(e.target.value))}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2"
          />
          <button onClick={assignCoin} className="rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3 py-2 text-sm">
            Coin Tanımla
          </button>
          <button onClick={resetPassword} className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/20 px-3 py-2 text-sm">
            Şifre Sıfırla
          </button>
        </div>
      </section>

      <section className="cyber-card rounded-3xl p-4">
        <h2 className="text-sm text-cyan-300">Kullanıcı Listesi</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left">Kullanıcı</th>
              <th className="text-left">Kupa</th>
              <th className="text-left">Coin</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => (
              <tr key={row.username} className="border-t border-zinc-800">
                <td className="py-1">{row.username}</td>
                <td>{row.trophies}</td>
                <td>{row.coins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="cyber-card rounded-3xl p-4">
        <h2 className="text-sm text-cyan-300">Audit Log</h2>
        <div className="mt-3 space-y-1 text-xs text-zinc-400">
          {logs.length === 0 && <p>Kayıt yok.</p>}
          {logs.map((log) => (
            <p key={log.id}>
              {new Date(log.createdAt).toLocaleString("tr-TR")} · {log.type} · {log.target}
            </p>
          ))}
        </div>
      </section>

      {info && <p className="text-sm text-zinc-300">{info}</p>}
    </div>
  );
}
