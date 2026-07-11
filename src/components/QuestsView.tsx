/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quest } from '../types';
import { getQuests, claimQuestReward } from '../utils/db';
import { Target, Award, CheckCircle2, Circle, Coins, Flame } from 'lucide-react';

interface QuestsViewProps {
  onRefreshUser: () => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({ onRefreshUser }) => {
  const [quests, setQuests] = useState<Quest[]>(() => getQuests());
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleClaim = (questId: string) => {
    const res = claimQuestReward(questId);
    if (res.success) {
      setQuests(getQuests());
      onRefreshUser();
      setClaimSuccess(`Tebrikler! +${res.rewardCoins} Coin hesabınıza aktarıldı.`);
      setTimeout(() => setClaimSuccess(null), 3500);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Header card with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-950 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Target className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-indigo-200">
                GÜNLÜK MÜCADELELER
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Botlara karşı oynayarak bu görevleri tamamla, özel coin ödüllerini kazan!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Notification Banner */}
      {claimSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs md:text-sm p-3.5 rounded-xl mb-6 font-medium animate-bounce">
          🎉 {claimSuccess}
        </div>
      )}

      {/* Quests list */}
      <div className="space-y-4">
        {quests.map((quest) => {
          const progressPercentage = Math.round((quest.currentCount / quest.targetCount) * 100);
          
          return (
            <div
              key={quest.id}
              className={`bg-slate-950/60 border rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all duration-200 ${
                quest.claimed
                  ? 'border-slate-900 opacity-60'
                  : quest.completed
                  ? 'border-emerald-500 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Mission Details */}
              <div className="flex-1 w-full">
                <div className="flex items-start gap-3">
                  {quest.claimed ? (
                    <CheckCircle2 className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                  ) : quest.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0 animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 mt-0.5 shrink-0" />
                  )}
                  
                  <div className="flex flex-col">
                    <span
                      className={`text-sm md:text-base font-display font-bold ${
                        quest.claimed ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}
                    >
                      {quest.title}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {quest.description}
                    </span>
                  </div>
                </div>

                {/* Progress bar and ratios */}
                <div className="mt-4 pl-8">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-slate-500">GÖREV İLERLEMESİ</span>
                    <span className={quest.completed ? 'text-emerald-400 font-bold' : 'text-indigo-400'}>
                      {quest.currentCount} / {quest.targetCount} ({progressPercentage}%)
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        quest.claimed
                          ? 'bg-slate-700'
                          : quest.completed
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action and Rewards Section */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-900">
                {/* Reward display */}
                <div className="flex items-center gap-1.5 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-xl">
                  <Coins size={14} className="text-yellow-400" />
                  <span className="text-xs font-mono font-bold text-yellow-500">+{quest.rewardCoins} Coin</span>
                </div>

                {/* Claim Button */}
                {quest.claimed ? (
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-xl text-xs font-bold font-mono bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed uppercase"
                  >
                    ALINDI
                  </button>
                ) : quest.completed ? (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all cursor-pointer uppercase tracking-wider"
                  >
                    ÖDÜLÜ AL
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed uppercase"
                  >
                    AKTİF
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
