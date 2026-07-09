"use client";

import { useMemo, useState } from "react";
import { dynamicPrice, getInventory, getProfile, saveProfile, STORE_ITEMS, unlockItem } from "@/lib/data/store";

export default function StorePage() {
  const [profile, setProfile] = useState(() => getProfile());
  const [owned, setOwned] = useState(() => getInventory());

  const ownedCount = owned.length;

  const items = useMemo(
    () =>
      STORE_ITEMS.map((item) => ({
        ...item,
        price: dynamicPrice(item, ownedCount),
      })),
    [ownedCount],
  );

  const buy = (itemId: string, price: number) => {
    if (owned.includes(itemId) || profile.coins < price) return;
    const next = { ...profile, coins: profile.coins - price };
    saveProfile(next);
    unlockItem(itemId);
    setProfile(next);
    setOwned(getInventory());
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl">Mağaza</h1>
      <p className="text-sm text-zinc-400">Dinamik fiyat matrisi aktif. Sahip olunan ürün sayısı arttıkça fiyatlar ölçeklenir.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const hasItem = owned.includes(item.id);
          return (
            <div key={item.id} className="cyber-card rounded-2xl p-4">
              <p className="text-sm text-cyan-300">{item.name}</p>
              <p className="mt-1 text-xs text-zinc-400">{item.rarity.toUpperCase()} · {item.animated ? "RGB" : "Static"}</p>
              <button
                disabled={hasItem || profile.coins < item.price}
                onClick={() => buy(item.id, item.price)}
                className="mt-3 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3 py-2 text-sm disabled:opacity-40"
              >
                {hasItem ? "Satın Alındı" : `${item.price} Coin`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
