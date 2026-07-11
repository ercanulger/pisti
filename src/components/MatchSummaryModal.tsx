/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player, MatchHistory } from '../types';
import { Award, Trophy, Coins, Star, CheckCircle, ArrowRight } from 'lucide-react';

interface MatchSummaryModalProps {
  onClose: () => void;
  historyItem: MatchHistory;
  currentUser: Player;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({ onClose, historyItem, currentUser }) => {
  const isWinner = historyItem.winnerId === currentUser.id;
  
  // Find the statistics for the human player
  const playerStat = historyItem.players.find((p) => p.isPlayer);
  const userEloChange = playerStat ? playerStat.eloChange : 0;
  const userScore = playerStat ? playerStat.score : 0;

  // Find the winner's username
  const winnerName = historyItem.players.find((p) => p.username === (historyItem.winnerId === currentUser.id ? currentUser.username : historyItem.winnerId))?.username || 'Bilinmeyen Oyuncu';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Decorative glows */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
        isWinner ? 'bg-emerald-500/10' : 'bg-red-500/10'
      }`} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modal Wrapper */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative animate-scale-in my-8">
        
        {/* Banner with celebrate graphic */}
        <div className={`p-6 text-center border-b border-slate-800/60 relative overflow-hidden ${
          isWinner 
            ? 'bg-gradient-to-b from-emerald-950/50 to-transparent' 
            : 'bg-gradient-to-b from-indigo-950/40 to-transparent'
        }`}>
          {isWinner ? (
            <div className="mx-auto w-16 h-16 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
              <Trophy size={32} />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-3.5 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Award size={32} />
            </div>
          )}

          <h2 className="text-xl md:text-2xl font-display font-extrabold text-slate-100 tracking-tight">
            {isWinner ? 'TEBRİKLER, KAZANDIN!' : 'MAÇ TAMAMLANDI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isWinner 
              ? 'Bot rakiplerini zekanla alt ettin ve büyük ödülü kazandın!' 
              : `Maçın galibi: ${winnerName}. Bir sonraki elde intikamını al!`
            }
          </p>
        </div>

        {/* Content detail */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Gains Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coins earned */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 font-mono block mb-1 uppercase tracking-wider">KAZANILAN COIN</span>
              <span className="text-xl md:text-2xl font-mono font-bold text-yellow-500 flex items-center justify-center gap-1.5">
                <Coins size={20} className="text-yellow-500 animate-spin" style={{ animationDuration: '8s' }} />
                +{historyItem.coinsEarned}
              </span>
            </div>

            {/* Elo earned */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-center">
              <span className="text-[10px] text-slate-500 font-mono block mb-1 uppercase tracking-wider">KUPA DEĞİŞİMİ (ELO)</span>
              <span className={`text-xl md:text-2xl font-mono font-bold flex items-center justify-center gap-1.5 ${
                userEloChange >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                <Trophy size={20} />
                {userEloChange >= 0 ? `+${userEloChange}` : userEloChange}
              </span>
            </div>
          </div>

          {/* Scores Table */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">PUAN VE REKABET SIRALAMASI</h3>
            
            <div className="bg-slate-950 border border-slate-900 rounded-2xl divide-y divide-slate-900 overflow-hidden">
              {historyItem.players.map((p, index) => {
                const isWinnerPlayer = p.username === winnerName;
                const isUser = p.isPlayer;

                return (
                  <div
                    key={index}
                    className={`px-4 py-3 flex items-center justify-between text-xs md:text-sm ${
                      isUser ? 'bg-indigo-950/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-mono w-4">#{index + 1}</span>
                      <span className={`font-semibold ${
                        isUser ? 'text-cyan-400 font-bold' : 'text-slate-300'
                      }`}>
                        {p.username} {isUser && '(Sen)'}
                      </span>
                      {isWinnerPlayer && (
                        <span className="bg-amber-950 text-amber-400 border border-amber-800/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest">
                          Galip
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-200 font-bold">{p.score} Puan</span>
                      <span className={`font-mono text-xs ${
                        p.eloChange >= 0 ? 'text-emerald-500' : 'text-red-400'
                      }`}>
                        {p.eloChange >= 0 ? `+${p.eloChange}` : p.eloChange} Elo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats details */}
          <div className="bg-indigo-950/10 border border-indigo-950 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs leading-relaxed text-slate-400">
              <span className="font-bold text-slate-200">Göreviniz Güncellendi!</span>
              <span>Bu eldeki başarılarınız günlük ve haftalık görev havuzunuza başarıyla eklendi. Ödülleri almak için 'Görevler' tabını kontrol etmeyi unutmayın.</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-100 text-xs md:text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all cursor-pointer uppercase tracking-wider"
          >
            <span>Lobiden Çık ve Dön</span>
            <ArrowRight size={14} />
          </button>

        </div>

      </div>
    </div>
  );
};
