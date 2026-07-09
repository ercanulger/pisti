"use client";

import { useState } from "react";
import { getProfile, saveProfile } from "@/lib/data/store";

const quests = [
  { id: "q1", title: "1 Maç Kazan", reward: 60 },
  { id: "q2", title: "2 Pişti Yap", reward: 90 },
  { id: "q3", title: "Günlük Bonus Al", reward: 30 },
];

export default function QuestsPage() {
  const [profile, setProfile] = useState(() => getProfile());
  const [done, setDone] = useState<string[]>([]);

  const complete = (id: string, reward: number) => {
    if (done.includes(id)) return;
    const next = { ...profile, coins: profile.coins + reward };
    saveProfile(next);
    setProfile(next);
    setDone((prev) => [...prev, id]);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl">Görevler</h1>
      {quests.map((quest) => (
        <div key={quest.id} className="cyber-card rounded-2xl p-4">
          <p>{quest.title}</p>
          <p className="text-sm text-zinc-400">Ödül: {quest.reward} coin</p>
          <button
            onClick={() => complete(quest.id, quest.reward)}
            disabled={done.includes(quest.id)}
            className="mt-3 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 px-3 py-2 text-sm disabled:opacity-40"
          >
            {done.includes(quest.id) ? "Tamamlandı" : "Görevi Tamamla"}
          </button>
        </div>
      ))}
    </section>
  );
}
