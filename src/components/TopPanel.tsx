/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, ShopItem } from '../types';
import { DEFAULT_SHOP_ITEMS } from '../utils/db';
import { Coins, Trophy, ShieldAlert, Award, Sun, Moon } from 'lucide-react';

interface TopPanelProps {
  user: Player;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopPanel: React.FC<TopPanelProps> = ({ user, onOpenAdmin, isAdmin, theme, onToggleTheme }) => {
  // Find equipped frame style
  const equippedFrame = DEFAULT_SHOP_ITEMS.find((item) => item.id === user.selectedFrame);
  const equippedFont = DEFAULT_SHOP_ITEMS.find((item) => item.id === user.selectedFont);
  const equippedColor = DEFAULT_SHOP_ITEMS.find((item) => item.id === user.selectedColor);
  const equippedBadge = DEFAULT_SHOP_ITEMS.find((item) => item.id === user.selectedBadge);

  const frameClass = equippedFrame ? equippedFrame.value : 'border border-slate-700';
  const fontClass = equippedFont ? equippedFont.value : 'font-sans';
  const colorClass = equippedColor ? equippedColor.value : 'text-slate-200';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Admin Access */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 tracking-tight select-none">
              pisti<span className="text-pink-500 font-light">.game</span>
            </h1>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest hidden md:inline-block">
              Cyber-Classic AAA Arena
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full text-xs font-mono font-semibold transition-all shadow-[0_0_8px_rgba(239,68,68,0.1)] hover:shadow-[0_0_12px_rgba(239,68,68,0.3)] cursor-pointer"
            >
              <ShieldAlert size={12} className="animate-pulse" />
              <span>YÖNETİM</span>
            </button>
          )}
        </div>

        {/* User Stats Panel */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 md:p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition-all cursor-pointer shadow-[0_0_8px_rgba(0,0,0,0.2)] flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
          >
            {theme === 'dark' ? (
              <Sun size={14} className="text-amber-400 animate-pulse" />
            ) : (
              <Moon size={14} className="text-indigo-400" />
            )}
          </button>

          {/* Cups (Elo) */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-indigo-950/30 border border-indigo-900/60 px-2.5 py-1 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            <div className="flex flex-col">
              <span className="text-[9px] text-indigo-400 font-mono leading-none">KUPA</span>
              <span className="text-xs md:text-sm font-mono font-bold text-slate-100">{user.elo}</span>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-amber-950/30 border border-amber-900/60 px-2.5 py-1 rounded-lg">
            <Coins className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex flex-col">
              <span className="text-[9px] text-amber-400 font-mono leading-none">COIN</span>
              <span className="text-xs md:text-sm font-mono font-bold text-slate-100">{user.coins}</span>
            </div>
          </div>

          {/* Avatar and Info */}
          <div className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 border-l border-slate-800">
            <div className="flex flex-col text-right hidden sm:flex">
              <div className="flex items-center gap-1 justify-end">
                {equippedBadge && (
                  <span className="text-[10px] bg-indigo-900/80 border border-indigo-500/30 px-1 py-0.5 rounded text-indigo-300 font-semibold flex items-center gap-0.5 shadow-sm">
                    <Award size={10} className="text-amber-400" />
                    {equippedBadge.badgeText || equippedBadge.name}
                  </span>
                )}
                {user.username === 'ercanulger' && (
                  <span className="text-[9px] bg-rose-950/80 border border-rose-500/50 px-1 py-0.5 rounded text-rose-300 font-mono font-extrabold uppercase tracking-wider">
                    KURUCU
                  </span>
                )}
              </div>
              <span className={`text-xs md:text-sm ${fontClass} ${colorClass}`}>
                {user.username}
              </span>
            </div>

            {/* Framed Avatar */}
            <div className="relative">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center p-0.5 transition-all duration-500 ${frameClass}`}>
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Dynamic status light */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-950 shadow-sm animate-ping" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-950 shadow-sm" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
