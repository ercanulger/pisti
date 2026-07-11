/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Trophy, ShoppingBag, Target, User } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Ana Menü', icon: Home },
    { id: 'leaderboard' as TabType, label: 'Sıralama', icon: Trophy },
    { id: 'shop' as TabType, label: 'Mağaza', icon: ShoppingBag },
    { id: 'quests' as TabType, label: 'Görevler', icon: Target },
    { id: 'profile' as TabType, label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 pb-safe shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-2 select-none group transition-all duration-300 relative cursor-pointer"
            >
              {/* Highlight background glow */}
              {isActive && (
                <span className="absolute -top-1 w-12 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full shadow-[0_0_12px_#22d3ee]" />
              )}

              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-950/50 text-cyan-400 scale-110 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform duration-300 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-2 group-hover:scale-110'
                  }`}
                />
              </div>

              <span
                className={`text-[9px] mt-0.5 font-sans font-medium transition-colors duration-300 ${
                  isActive ? 'text-slate-100 font-bold' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
