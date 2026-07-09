"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getProfile } from "@/lib/data/store";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", label: "Ana Menü", icon: "🏠" },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆" },
  { href: "/store", label: "Mağaza", icon: "🛍️" },
  { href: "/quests", label: "Görevler", icon: "🎯" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

export function TopPanel() {
  const [profile, setProfile] = useState(() => getProfile());

  useEffect(() => {
    const interval = setInterval(() => setProfile(getProfile()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-30 border-b border-cyan-400/20 bg-black/70 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full border border-fuchsia-500/50 bg-fuchsia-500/20 text-lg">
            {profile.avatar}
          </span>
          <div>
            <p className="text-xs text-zinc-400">{profile.username}</p>
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              {profile.badges.map((badge) => (
                <span key={badge} className="rounded-full bg-cyan-500/20 px-2 py-0.5">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full border border-amber-300/40 bg-amber-500/20 px-3 py-1">
            🏆 {profile.trophies}
          </span>
          <span className="rounded-full border border-cyan-300/40 bg-cyan-500/20 px-3 py-1">
            🪙 {profile.coins}
          </span>
        </div>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-500/20 bg-black/80 px-2 py-2 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[11px] text-zinc-300"
            >
              {active && (
                <motion.span
                  layoutId="navGlow"
                  className="absolute inset-0 rounded-xl bg-cyan-500/20"
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                />
              )}
              <span className="relative">{tab.icon}</span>
              <span className="relative whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
