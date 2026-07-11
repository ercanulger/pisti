/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Player } from '../types';
import { getMatchHistory, getUserInventory, DEFAULT_SHOP_ITEMS, updateCurrentUser } from '../utils/db';
import { Award, Calendar, Check, Flame, Trophy, Coins, History, User } from 'lucide-react';

interface ProfileViewProps {
  currentUser: Player;
  onRefreshUser: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onRefreshUser }) => {
  const history = getMatchHistory();
  const inventory = getUserInventory(currentUser.id);

  // Calculate advanced player statistics
  const userHistory = history.filter((m) => m.players.some((p) => p.username === currentUser.username && p.isPlayer));
  const gamesPlayed = userHistory.length;
  const gamesWon = userHistory.filter((m) => m.winnerId === currentUser.id).length;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  
  const totalCoinsEarned = userHistory.reduce((acc, m) => acc + m.coinsEarned, 0);
  const totalEloEarned = userHistory.reduce((acc, m) => acc + m.eloEarned, 0);
  const maxScore = userHistory.reduce((max, m) => {
    const playerStat = m.players.find((p) => p.username === currentUser.username);
    return playerStat && playerStat.score > max ? playerStat.score : max;
  }, 0);

  const handleEquipItem = (itemId: string, type: string) => {
    let updatedFields: Partial<Player> = {};
    if (type === 'frame') {
      updatedFields.selectedFrame = currentUser.selectedFrame === itemId ? undefined : itemId;
    } else if (type === 'font') {
      updatedFields.selectedFont = currentUser.selectedFont === itemId ? undefined : itemId;
    } else if (type === 'color') {
      updatedFields.selectedColor = currentUser.selectedColor === itemId ? undefined : itemId;
    } else if (type === 'badge') {
      updatedFields.selectedBadge = currentUser.selectedBadge === itemId ? undefined : itemId;
    }

    updateCurrentUser(updatedFields);
    onRefreshUser();
  };

  const isEquipped = (itemId: string, type: string) => {
    if (type === 'frame') return currentUser.selectedFrame === itemId;
    if (type === 'font') return currentUser.selectedFont === itemId;
    if (type === 'color') return currentUser.selectedColor === itemId;
    if (type === 'badge') return currentUser.selectedBadge === itemId;
    return false;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8">
      
      {/* 1. Main Profile Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/70 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          {/* Framed Avatar with Sub-Badges */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative">
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-900 p-1 shadow-xl transition-all duration-500 ${
                DEFAULT_SHOP_ITEMS.find((i) => i.id === currentUser.selectedFrame)?.value || 'border-2 border-slate-800'
              }`}>
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 p-1.5 rounded-full border-2 border-slate-950 text-slate-100 shadow">
                <User size={14} />
              </div>
            </div>

            {/* Rosettes / Badges directly beneath the avatar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 max-w-[140px]">
              {currentUser.username === 'ercanulger' && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(239,68,68,0.25)] uppercase tracking-wider font-mono">
                  🎖️ KURUCU
                </div>
              )}
              {DEFAULT_SHOP_ITEMS.find((i) => i.id === currentUser.selectedBadge) ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.25)] font-mono">
                  🏅 {DEFAULT_SHOP_ITEMS.find((i) => i.id === currentUser.selectedBadge)?.badgeText}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] bg-slate-900/60 text-slate-400 border border-slate-800/60 font-mono">
                  🎗️ Üye
                </div>
              )}
            </div>
          </div>

          {/* User Meta Information */}
          <div className="text-center md:text-left flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className={`text-xl md:text-2xl font-extrabold tracking-tight ${
                DEFAULT_SHOP_ITEMS.find((i) => i.id === currentUser.selectedFont)?.value || 'font-sans text-slate-100'
              } ${
                DEFAULT_SHOP_ITEMS.find((i) => i.id === currentUser.selectedColor)?.value || 'text-slate-100'
              }`}>
                {currentUser.username}
              </h2>
            </div>
            
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
              pisti.game ÜYESİ • SEVİYE: {currentUser.username === 'ercanulger' ? 'Admin' : 'Usta Oyuncu'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={14} className="text-slate-500" />
                <span>Kayıt Tarihi: 10.07.2026</span>
              </div>
            </div>
          </div>

          {/* Large Elo and Coins widgets */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
            <div className="bg-slate-950/80 border border-slate-900/80 px-4 py-3 rounded-2xl text-center min-w-[90px] shadow-sm">
              <span className="text-[10px] text-slate-500 font-mono block mb-0.5 uppercase">KUPA ELO</span>
              <span className="text-lg font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                <Flame size={16} className="text-amber-500" />
                {currentUser.elo}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-900/80 px-4 py-3 rounded-2xl text-center min-w-[90px] shadow-sm">
              <span className="text-[10px] text-slate-500 font-mono block mb-0.5 uppercase">COIN</span>
              <span className="text-lg font-mono font-bold text-yellow-500 flex items-center justify-center gap-1">
                <Coins size={16} className="text-yellow-500" />
                {currentUser.coins}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Oynanan Maç', value: gamesPlayed, icon: History, color: 'text-indigo-400', bg: 'bg-indigo-950/20 border-indigo-900/30' },
          { label: 'Kazanılan Maç', value: gamesWon, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/30' },
          { label: 'Kazanma Oranı', value: `${winRate}%`, icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-950/20 border-cyan-900/30' },
          { label: 'En Yüksek Skor', value: maxScore > 0 ? maxScore : 'YOK', icon: Flame, color: 'text-pink-400', bg: 'bg-pink-950/20 border-pink-900/30' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`border rounded-2xl p-4 flex items-center gap-3.5 ${stat.bg} shadow-sm`}>
              <div className={`p-2.5 bg-slate-950 border border-slate-900 rounded-xl ${stat.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{stat.label}</span>
                <span className="text-lg font-mono font-bold text-slate-100 mt-0.5">{stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Columns: Inventory & Match History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inventory Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="text-indigo-400" size={18} />
            <h3 className="text-base font-display font-bold text-slate-200">ENVANTER & ROZETLER</h3>
          </div>

          {inventory.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 text-center">
              <p className="text-xs text-slate-500">Kuşanılacak eşyanız yok. Mağazadan hemen yeni tasarımlar satın alabilirsiniz!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {inventory.map((inv) => {
                // Find matching item details
                const item = DEFAULT_SHOP_ITEMS.find((shop) => shop.id === inv.itemId);
                const badgePlaceholder = inv.itemId === 'badge_admin_owner' 
                  ? { id: 'badge_admin_owner', name: 'Admin Badge', type: 'badge' as const, description: 'Yönetim rozeti', value: '👑 Admin', badgeText: '👑 Admin' } 
                  : null;
                const itemDetail = item || badgePlaceholder;
                if (!itemDetail) return null;

                const equipped = isEquipped(itemDetail.id, itemDetail.type);

                return (
                  <div
                    key={inv.id}
                    className={`bg-slate-950/60 border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors ${
                      equipped ? 'border-indigo-500/80 bg-indigo-950/10' : 'border-slate-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-display font-bold text-slate-200">{itemDetail.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">{itemDetail.type}</span>
                    </div>

                    <button
                      onClick={() => handleEquipItem(itemDetail.id, itemDetail.type)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold select-none cursor-pointer transition-colors ${
                        equipped
                          ? 'bg-indigo-950 border border-indigo-700 text-indigo-400 hover:bg-slate-900'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-slate-100'
                      }`}
                    >
                      {equipped ? 'Çıkar' : 'Kuşan'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <History className="text-indigo-400" size={18} />
            <h3 className="text-base font-display font-bold text-slate-200">MAÇ GEÇMİŞİ</h3>
          </div>

          {userHistory.length === 0 ? (
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
              <Trophy size={28} className="text-slate-700" />
              <p className="text-xs text-slate-400">Henüz oyun geçmişiniz yok.</p>
              <p className="text-[11px] text-slate-500">Ana menüye dönüp 'Oyuna Başla' butonuyla botlara meydan okuyabilirsiniz!</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[450px] overflow-y-auto pr-1">
              {userHistory.map((match) => {
                const isWinner = match.winnerId === currentUser.id;
                const formattedDate = new Date(match.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={match.id}
                    className={`bg-slate-950/40 border rounded-2xl p-4 flex flex-col gap-3 transition-all ${
                      isWinner ? 'border-emerald-950 bg-emerald-950/5' : 'border-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">{formattedDate}</span>
                      <span className={isWinner ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {isWinner ? 'GALİBİYET' : 'YENİLGİ'}
                      </span>
                    </div>

                    {/* Scores row */}
                    <div className="flex items-center gap-4 flex-wrap text-sm border-t border-b border-slate-900/60 py-2.5 justify-between">
                      {match.players.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`text-xs ${p.isPlayer ? 'text-cyan-400 font-semibold' : 'text-slate-400'}`}>
                            {p.username}
                          </span>
                          <span className="font-mono text-xs text-slate-200">({p.score} Puan)</span>
                        </div>
                      ))}
                    </div>

                    {/* Gains row */}
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Coins size={12} /> +{match.coinsEarned}
                        </span>
                        <span className={`flex items-center gap-1 ${match.eloEarned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <Trophy size={12} /> {match.eloEarned >= 0 ? `+${match.eloEarned}` : match.eloEarned} Elo
                        </span>
                      </div>
                      <span className="text-slate-500">Toplam: {match.pointsCollected} Puan toplandı</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
