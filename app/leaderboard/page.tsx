"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/data/store";

export default function LeaderboardPage() {
  const [rows, setRows] = useState(() => getLeaderboard());

  useEffect(() => {
    const timer = setInterval(() => setRows(getLeaderboard()), 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="cyber-card rounded-3xl p-4">
      <h1 className="text-2xl">Leaderboard</h1>
      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Kullanıcı</th>
              <th className="p-2 text-left">Kupa</th>
              <th className="p-2 text-left">Coin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.username} className="border-t border-zinc-800">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{row.username}</td>
                <td className="p-2">{row.trophies}</td>
                <td className="p-2">{row.coins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
