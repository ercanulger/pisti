"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInventory, getProfile, STORE_ITEMS } from "@/lib/data/store";

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => getProfile());
  const [inventory, setInventory] = useState(() => getInventory());

  useEffect(() => {
    setProfile(getProfile());
    setInventory(getInventory());
  }, []);

  const ownedItems = STORE_ITEMS.filter((item) => inventory.includes(item.id));

  return (
    <section className="space-y-4">
      <h1 className="text-2xl">Profil</h1>
      <div className="cyber-card rounded-3xl p-5">
        <p className="text-lg">{profile.avatar} {profile.username}</p>
        <p className="text-sm text-zinc-400">{profile.email}</p>
        <div className="mt-3 flex gap-3 text-sm">
          <span>Kupa: {profile.trophies}</span>
          <span>Coin: {profile.coins}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {profile.badges.map((badge) => (
            <span key={badge} className="rounded-full bg-cyan-500/20 px-2 py-1">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="cyber-card rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <h2>Envanter</h2>
          <Link className="text-xs text-cyan-300" href="/store">
            Mağazaya Git
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {ownedItems.length === 0 && <p className="text-sm text-zinc-500">Henüz ürün satın alınmadı.</p>}
          {ownedItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 text-sm">
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <Link href="/admin" className="inline-block rounded-xl border border-rose-400/40 bg-rose-500/20 px-3 py-2 text-sm">
        Admin Paneli
      </Link>
    </section>
  );
}
