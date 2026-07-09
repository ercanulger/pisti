"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameEngine } from "@/lib/game/engine";
import { CardView } from "@/components/card-view";
import { addMatchResult, getProfile, pushLiveFeed } from "@/lib/data/store";

type EngineState = ReturnType<GameEngine["getState"]>;

const reconnectWindow = 30;

export function GameClient() {
  const [engine] = useState(() => new GameEngine(getProfile().username));
  const [state, setState] = useState<EngineState>(() => engine.getState());
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [reconnectLeft, setReconnectLeft] = useState(reconnectWindow);
  const [offline, setOffline] = useState(false);
  const lastEventRef = useRef<string | null>(null);

  const human = state.players[0];
  const hand = state.hands.get(human.id) ?? [];
  const isMyTurn = state.players[state.turn]?.id === human.id;

  useEffect(() => {
    const onOffline = () => {
      setOffline(true);
      setReconnectLeft(reconnectWindow);
    };
    const onOnline = () => {
      setOffline(false);
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  useEffect(() => {
    if (!offline) return;

    const timer = setInterval(() => {
      setReconnectLeft((prev) => {
        if (prev <= 1) {
          setOffline(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offline]);

  useEffect(() => {
    if (!state.finished) return;

    const result = engine.getMatchResult();
    const usernames: Record<string, string> = {};
    state.players.forEach((p) => {
      usernames[p.id] = p.name;
    });

    addMatchResult(result, usernames);
    const winnerName = usernames[result.winnerId] ?? "Oyuncu";
    pushLiveFeed(`${winnerName} maç sonunda kupa kazandı.`);
    setSummaryOpen(true);
  }, [engine, state.finished, state.players]);

  useEffect(() => {
    const latest = state.events[0];
    if (!latest || latest.id === lastEventRef.current) return;
    lastEventRef.current = latest.id;
    if (latest.text.includes("PİŞTİ")) {
      pushLiveFeed(`🔥 ${latest.text}`);
    }
  }, [state.events]);

  const pistiVisible = state.events[0]?.text.includes("PİŞTİ") ?? false;

  const summary = useMemo(() => {
    if (!state.finished) return null;
    return engine.getMatchResult();
  }, [engine, state.finished]);

  const playCard = () => {
    if (!selectedCard) return;

    try {
      if (navigator.vibrate) navigator.vibrate(16);
      engine.playHuman(selectedCard);
      setState(engine.getState());
      setSelectedCard(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hamle doğrulanamadı.");
    }
  };

  return (
    <div className="space-y-4">
      {offline && (
        <div className="rounded-2xl border border-orange-400/60 bg-orange-500/15 p-3 text-sm text-orange-200">
          Bağlantı kesildi. {reconnectLeft}s içinde yeniden bağlanmazsanız tur botlara geçer.
        </div>
      )}

      <section className="grid gap-3 rounded-3xl border border-cyan-500/20 bg-zinc-950/80 p-4 sm:grid-cols-4">
        {state.players.map((player, index) => {
          const isTurn = state.turn === index;
          return (
            <div
              key={player.id}
              className={`rounded-2xl border p-3 text-xs ${
                isTurn ? "border-cyan-300 bg-cyan-400/10" : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <p className="font-semibold">{player.name}</p>
              <p className="mt-1 text-zinc-400">Eldeki Kart: {(state.hands.get(player.id) ?? []).length}</p>
            </div>
          );
        })}
      </section>

      <section className="relative grid min-h-56 place-items-center overflow-hidden rounded-3xl border border-fuchsia-400/20 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,.1),rgba(0,0,0,.9))] p-4">
        <AnimatePresence>
          {pistiVisible && (
            <motion.h2
              key={state.events[0]?.id}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="pointer-events-none absolute z-20 text-5xl font-black tracking-widest text-amber-300"
            >
              PİŞTİ!
            </motion.h2>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state.events[0] && (
            <motion.span
              key={`ripple-${state.events[0].id}`}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute size-12 rounded-full bg-cyan-400/20"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {state.table.length === 0 ? (
            <span className="text-sm text-zinc-400">Masa boş</span>
          ) : (
            state.table.map((card) => <CardView key={card.id} card={card} />)
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-500/20 bg-black/80 p-3">
        <div className="relative mx-auto mt-4 flex min-h-44 max-w-3xl items-end justify-center gap-0">
          {hand.map((card, index) => {
            const mid = (hand.length - 1) / 2;
            const fanAngle = (index - mid) * 6;

            return (
              <div key={card.id} className="-mx-2 sm:-mx-3">
                <CardView
                  card={card}
                  selected={selectedCard === card.id}
                  fanAngle={fanAngle}
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    setSelectedCard(card.id);
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            disabled={!isMyTurn || !selectedCard || state.finished || offline}
            onClick={playCard}
            className="rounded-xl border border-cyan-300/50 bg-cyan-400/20 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kartı Masaya At
          </button>
          <p className="text-xs text-zinc-400">
            {isMyTurn ? "Sıra sende" : `${state.players[state.turn]?.name} oynuyor`} · Destede {state.deckCount} kart
          </p>
        </div>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">Canlı Oyun Akışı</h3>
        <div className="space-y-1 text-xs text-zinc-400">
          {state.events.slice(0, 6).map((event) => (
            <p key={event.id}>• {event.text}</p>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {summaryOpen && summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-md rounded-3xl border border-cyan-400/30 bg-zinc-950 p-5"
            >
              <h3 className="text-xl font-bold text-cyan-300">Match Summary</h3>
              <p className="mt-1 text-sm text-zinc-400">Kazanan: {state.players.find((p) => p.id === summary.winnerId)?.name}</p>
              <div className="mt-4 space-y-2 text-sm">
                {summary.scoreboard.map((row) => (
                  <div key={row.playerId} className="flex justify-between rounded-xl bg-zinc-900 px-3 py-2">
                    <span>{state.players.find((p) => p.id === row.playerId)?.name}</span>
                    <span>
                      {row.score} puan · {row.trophiesDelta > 0 ? "+" : ""}
                      {row.trophiesDelta} kupa
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.assign("/")}
                className="mt-4 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/20 py-2"
              >
                Ana Menüye Dön
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
