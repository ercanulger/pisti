"use client";

import { motion } from "framer-motion";
import { Card } from "@/lib/game/types";

type Props = {
  card: Card;
  hidden?: boolean;
  selected?: boolean;
  fanAngle?: number;
  onClick?: () => void;
};

const suitColor = (suit: Card["suit"]) => (suit === "♥" || suit === "♦" ? "text-rose-400" : "text-zinc-100");

export function CardView({ card, hidden, selected, fanAngle = 0, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.06 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ rotate: fanAngle }}
      className={`relative h-36 w-24 rounded-2xl border p-2 text-left shadow-2xl transition ${
        selected
          ? "border-cyan-300 bg-zinc-900"
          : "border-zinc-700 bg-gradient-to-br from-zinc-900 to-zinc-950"
      }`}
    >
      {hidden ? (
        <div className="grid h-full place-items-center rounded-xl border border-amber-200/30 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,.35),rgba(147,51,234,.25),rgba(0,0,0,.8))] text-center">
          <p className="text-xs font-semibold tracking-widest text-amber-100">pisti.game</p>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between rounded-xl border border-zinc-600/60 bg-[linear-gradient(120deg,#171717,#0a0a0a_40%,#262626)] p-1">
          <div className={`text-lg font-black ${suitColor(card.suit)}`}>
            {card.rank}
            <span className="ml-1 text-base">{card.suit}</span>
          </div>
          <div className={`self-center text-3xl ${suitColor(card.suit)}`}>{card.suit}</div>
          <div className={`self-end text-lg font-black ${suitColor(card.suit)} rotate-180`}>
            {card.rank}
            <span className="ml-1 text-base">{card.suit}</span>
          </div>
        </div>
      )}
    </motion.button>
  );
}
