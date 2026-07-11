/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { DEFAULT_SHOP_ITEMS, getUsers } from '../utils/db';
import { Trophy, Award, UserCheck, Flame, Radio } from 'lucide-react';

interface LeaderboardViewProps {
  players: Player[];
  currentUser: Player;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ players, currentUser }) => {
  const [localPlayers, setLocalPlayers] = useState<Player[]>(() => players);

  // Poll database every 5 seconds to provide a fully live leaderboard experience
  useEffect(() => {
    setLocalPlayers(getUsers());
    const interval = setInterval(() => {
      setLocalPlayers(getUsers());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter out bots and sort by Elo descending
  const sortedPlayers = [...localPlayers]
    .filter(p => !p.isBot)
    .sort((a, b) => b.elo - a.elo);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Header card with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 mb-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-950 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-indigo-200 flex items-center gap-2">
                LİDERLİK TABLOSU
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono animate-pulse">
                  <Radio size={10} className="animate-pulse" />
                  CANLI
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                pisti.game arena genelinde anlık güncellenen en yüksek Elo (Kupa) sıralaması.
              </p>
            </div>
          </div>
          
          {/* User's current rank stats card */}
          <div className="bg-slate-950/60 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-5 w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-mono">SENİN SIRAN</span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                #{sortedPlayers.findIndex(p => p.id === currentUser.id) + 1}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-mono">MEVCUT KUPAN</span>
              <span className="text-lg font-mono font-bold text-amber-400 flex items-center gap-1">
                <Flame size={16} className="text-amber-500" />
                {currentUser.elo}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30">
                <th className="px-4 py-4 text-left text-xs font-mono text-slate-500 font-bold uppercase tracking-wider w-16">
                  Sıra
                </th>
                <th className="px-4 py-4 text-left text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
                  Kullanıcı Adı / Rütbe
                </th>
                <th className="px-4 py-4 text-center text-xs font-mono text-slate-500 font-bold uppercase tracking-wider w-24">
                  Tür
                </th>
                <th className="px-4 py-4 text-right text-xs font-mono text-slate-500 font-bold uppercase tracking-wider w-32">
                  Elo Kupa
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {sortedPlayers.map((player, index) => {
                const isSelf = player.id === currentUser.id;
                const rank = index + 1;

                // Find equipped frame/badge/font/color style details
                const equippedFrame = DEFAULT_SHOP_ITEMS.find((item) => item.id === player.selectedFrame);
                const equippedFont = DEFAULT_SHOP_ITEMS.find((item) => item.id === player.selectedFont);
                const equippedColor = DEFAULT_SHOP_ITEMS.find((item) => item.id === player.selectedColor);
                const equippedBadge = DEFAULT_SHOP_ITEMS.find((item) => item.id === player.selectedBadge);

                const frameClass = equippedFrame ? equippedFrame.value : 'border border-slate-800';
                const fontClass = equippedFont ? equippedFont.value : 'font-sans';
                const colorClass = equippedColor ? equippedColor.value : 'text-slate-200';

                // Ranking styling presets
                let rankBadge = '';
                let rankBg = 'bg-slate-900/10';
                if (rank === 1) {
                  rankBadge = '🥇';
                  rankBg = 'bg-amber-500/10 text-amber-400 font-extrabold';
                } else if (rank === 2) {
                  rankBadge = '🥈';
                  rankBg = 'bg-slate-300/10 text-slate-300 font-extrabold';
                } else if (rank === 3) {
                  rankBadge = '🥉';
                  rankBg = 'bg-amber-700/10 text-amber-600 font-extrabold';
                }

                return (
                  <tr
                    key={player.id}
                    className={`hover:bg-slate-900/30 transition-colors duration-150 ${
                      isSelf ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    {/* Rank cell */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono">
                      {rankBadge ? (
                        <span className="text-lg">{rankBadge}</span>
                      ) : (
                        <span className="text-slate-500 pl-1">{rank}</span>
                      )}
                    </td>

                    {/* Username cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Framed avatar */}
                        <div className="relative">
                          <div className={`w-9 h-9 rounded-full overflow-hidden bg-slate-900 p-0.5 transition-all ${frameClass}`}>
                            <img
                              src={player.avatarUrl}
                              alt={player.username}
                              className="w-full h-full rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>

                        {/* Nickname, Font, Badge & Indicator */}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-sm ${fontClass} ${colorClass} font-semibold flex items-center gap-1`}>
                              {player.username}
                              {isSelf && (
                                <UserCheck size={12} className="text-cyan-400" title="Siz" />
                              )}
                            </span>
                            
                            {equippedBadge && (
                              <span className="text-[9px] bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-indigo-300 font-mono">
                                {equippedBadge.badgeText || equippedBadge.name}
                              </span>
                            )}

                            {player.id === 'user_ercanulger' && (
                              <span className="text-[9px] bg-rose-950/40 border border-rose-500/30 px-1 py-0.5 rounded text-rose-300 font-mono uppercase tracking-widest font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {player.isBot ? `Yapay Zeka (${player.botLevel === 'expert' ? 'Usta' : player.botLevel === 'intermediate' ? 'Dengeli' : 'Acemi'})` : 'Gerçek Oyuncu'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Bot/Player Indicator badge */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {player.isBot ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-950 text-purple-300 border border-purple-800/40">
                          ROBOT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          OYUNCU
                        </span>
                      )}
                    </td>

                    {/* Elo cell */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-mono font-bold text-slate-200">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>{player.elo}</span>
                        <Award size={14} className="text-indigo-400" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
