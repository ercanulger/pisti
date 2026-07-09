"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LiveFeed } from "@/components/live-feed";
import { getProfile, saveProfile } from "@/lib/data/store";

const modes = ["Tekli", "Eşli", "Özel Oda"];

export default function HomePage() {
  const [profile, setProfile] = useState(() => getProfile());
  const [mode, setMode] = useState(modes[0]);
  const [lastClaim, setLastClaim] = useState<number>(0);

  useEffect(() => {
    const value = Number(localStorage.getItem("pisti.dailyBonus") ?? 0);
    setLastClaim(value);
    setProfile(getProfile());
  }, []);

  const bonusReady = useMemo(() => Date.now() - lastClaim > 24 * 60 * 60 * 1000, [lastClaim]);

  const claimBonus = () => {
    if (!bonusReady) return;
    const next = { ...profile, coins: profile.coins + 90 };
    saveProfile(next);
    setProfile(next);
    const now = Date.now();
    localStorage.setItem("pisti.dailyBonus", String(now));
    setLastClaim(now);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <section className="cyber-card rounded-3xl p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">pisti.game</p>
          <h1 className="mt-3 text-3xl sm:text-4xl">Cyber-Classic Pişti Arenası</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-300">
            Mobil öncelikli, fluid UI, botlara karşı optimize edilmiş AAA deneyim.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/game"
              className="rounded-2xl border border-cyan-300/50 bg-cyan-400/20 px-6 py-3 text-sm font-semibold"
            >
              Oyuna Başla
            </Link>
            <div className="flex gap-2 text-xs">
              {modes.map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`rounded-full px-3 py-1 ${
                    mode === item
                      ? "border border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100"
                      : "border border-zinc-700 bg-zinc-900 text-zinc-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={claimBonus}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-sm"
          >
            🎁 Günlük Giriş Bonusu {bonusReady ? "Hazır" : "Beklemede"}
          </button>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {["Mobil-First", "Haptic Simülasyon", "Canlı Feed"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="cyber-card rounded-2xl p-4 text-sm"
            >
              <p className="text-cyan-300">{item}</p>
              <p className="mt-2 text-zinc-400">Profesyonel animasyon ve akıcı geçiş altyapısı hazır.</p>
            </motion.div>
          ))}
        </section>
      </div>

      <div className="space-y-4">
        <div className="cyber-card rounded-2xl p-4 text-sm">
          <p className="text-zinc-400">Aktif Kullanıcı</p>
          <p className="text-xl font-bold text-cyan-300">{profile.username}</p>
          <p className="mt-2 text-zinc-300">Kupa: {profile.trophies}</p>
          <p className="text-zinc-300">Coin: {profile.coins}</p>
        </div>
        <LiveFeed />
      </div>
    </div>
  );
}
