"use client";

import { useEffect, useState } from "react";
import { getLiveFeed } from "@/lib/data/store";

export function LiveFeed() {
  const [feed, setFeed] = useState(() => getLiveFeed());

  useEffect(() => {
    const timer = setInterval(() => setFeed(getLiveFeed()), 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="cyber-card rounded-2xl p-3">
      <h3 className="text-sm font-semibold text-cyan-300">Canlı Kupa Akışı</h3>
      <div className="mt-2 space-y-2 text-xs text-zinc-400">
        {feed.length === 0 && <p>Henüz canlı etkinlik yok.</p>}
        {feed.slice(0, 8).map((event) => (
          <p key={event.id}>• {event.text}</p>
        ))}
      </div>
    </aside>
  );
}
