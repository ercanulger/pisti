/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Player, LiveFeedItem } from '../types';
import { updateCurrentUser, writeAuditLog } from '../utils/db';
import { Play, Flame, Gift, Sparkles, Volume2, ShieldAlert, Wifi, Zap, Award, Star } from 'lucide-react';

interface DashboardViewProps {
  currentUser: Player;
  onRefreshUser: () => void;
  onStartGame: (mode: 'tekli' | 'esli' | 'ozel') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser, onRefreshUser, onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState<'tekli' | 'esli' | 'ozel'>('tekli');
  const [dailyClaimMsg, setDailyClaimMsg] = useState<string | null>(null);
  const [dailyCountdown, setDailyCountdown] = useState<string | null>(null);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>([]);

  // Seed live feeds with initial mock notifications
  useEffect(() => {
    const initialFeed: LiveFeedItem[] = [
      { id: '1', message: 'Masa #12: ercanulger usta botu alt ederek 24 Kupa kazandı!', time: 'Şimdi' },
      { id: '2', message: 'Masa #8: Usta Leyla tek elde 2 Pişti yakaladı!', time: '2 dk önce' },
      { id: '3', message: 'Market: ercanulger fütüristik RGB çerçeve kuşandı!', time: '5 dk önce' },
      { id: '4', message: 'Masa #3: Dengeli Selim Vale piştisi ile rakiplerini şaşırttı.', time: '8 dk önce' },
    ];
    setLiveFeed(initialFeed);

    // Dynamic feed updates every 9 seconds to create a lively platform feel
    const interval = setInterval(() => {
      const feedMessages = [
        'Masa #14: Çaylak Can az önce Acemi Kemal ile pişti yaptı!',
        'Market: Analitik Derya özel takma ad rengi satın aldı.',
        'Masa #9: Usta Leyla şampiyonluk yolunda +18 Kupa kazandı!',
        'Masa #21: ercanulger Vale piştisi patlatarak 20 puan aldı!',
        'Sistem: Günlük görev havuzları tüm oyuncular için yenilendi!',
        'Masa #7: Stajyer Ayşe oyuna geri bağlandı ve eline devam etti.',
        'Market: PİŞTİ-Tron 9000 mağazadan efsanevi rozet donandı.',
      ];

      const randomMsg = feedMessages[Math.floor(Math.random() * feedMessages.length)];
      const newItem: LiveFeedItem = {
        id: Date.now().toString(),
        message: randomMsg,
        time: 'Şimdi',
      };

      setLiveFeed((prev) => [newItem, ...prev.slice(0, 5)]); // Keep max 6 items
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  // Daily entry bonus check logic
  useEffect(() => {
    const checkCooldown = () => {
      const lastClaim = localStorage.getItem(`pisti_last_daily_claim_${currentUser.id}`);
      if (lastClaim) {
        const lastTime = parseInt(lastClaim);
        const timeDiff = Date.now() - lastTime;
        const cooldown = 24 * 60 * 60 * 1000; // 24 Hours

        if (timeDiff < cooldown) {
          const remaining = cooldown - timeDiff;
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          setDailyCountdown(`${hours}sa ${minutes}dk sonra`);
        } else {
          setDailyCountdown(null);
        }
      } else {
        setDailyCountdown(null);
      }
    };

    checkCooldown();
    const timer = setInterval(checkCooldown, 60000); // refresh every minute
    return () => clearInterval(timer);
  }, [currentUser.id]);

  const handleClaimDailyBonus = () => {
    const lastClaim = localStorage.getItem(`pisti_last_daily_claim_${currentUser.id}`);
    const cooldown = 24 * 60 * 60 * 1000; // 24 Hours

    if (lastClaim) {
      const lastTime = parseInt(lastClaim);
      if (Date.now() - lastTime < cooldown) {
        return; // still on cooldown
      }
    }

    // Grant 100 coins
    const updatedCoins = currentUser.coins + 150;
    updateCurrentUser({ coins: updatedCoins });
    localStorage.setItem(`pisti_last_daily_claim_${currentUser.id}`, Date.now().toString());

    writeAuditLog(currentUser.id, 'DAILY_BONUS_CLAIM', 'Günlük Giriş Ödülü alındı: +150 Coin.');
    
    onRefreshUser();
    setDailyClaimMsg('Harika! Günlük Giriş Ödülü olarak +150 Coin hesabınıza aktarıldı! 🎁');
    setDailyCountdown('23sa 59dk sonra');

    setTimeout(() => setDailyClaimMsg(null), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8 md:space-y-12">
      
      {/* 1. Main Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Animated backdrops */}
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 max-w-lg text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 mb-1 font-mono">
            <Wifi size={12} className="text-cyan-400 animate-pulse" />
            BAĞLANTI DURUMU: AKTİF
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-100 to-indigo-300 tracking-tight leading-none">
            CYBER-CLASSIC<br />PİŞTİ ARENASI
          </h2>
          
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Geleneksel Pişti kurallarının usta yapay zeka botları, Elo sıralama ligi ve RGB özelleştirme mağazası ile buluştuğu modern siber oyun alanı.
          </p>
        </div>

        {/* Big Game Play Controller */}
        <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-2xl w-full max-w-xs shrink-0 flex flex-col gap-4 relative z-10">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold text-center block uppercase">
            OYUN MODUNU SEÇ
          </span>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tekli', label: 'Tekli' },
              { id: 'esli', label: 'Eşli' },
              { id: 'ozel', label: 'Özel' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id as any)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                  selectedMode === mode.id
                    ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 font-extrabold shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                    : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onStartGame(selectedMode)}
            className="w-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-90 text-slate-950 font-display font-black tracking-widest text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Play size={16} fill="currentColor" />
            OYUNA BAŞLA
          </button>
        </div>
      </div>

      {/* 2. Secondary content row: Quests / Daily Bonus / Live Cup Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left widget column: Daily bonus & mini status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-3xl p-5 md:p-6 flex flex-col items-center text-center gap-4 relative">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">GÜNLÜK HEDİYE BOX</h3>
            
            <div
              onClick={dailyCountdown ? undefined : handleClaimDailyBonus}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 relative group cursor-pointer ${
                dailyCountdown
                  ? 'bg-slate-900/60 border-slate-800/60 text-slate-600'
                  : 'bg-amber-950/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]'
              }`}
            >
              <Gift size={36} className={dailyCountdown ? '' : 'animate-bounce'} />
              
              {!dailyCountdown && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow" />
              )}
            </div>

            <div className="space-y-1">
              <span className="text-sm font-display font-bold text-slate-200">24 Saatlik Ücretsiz Giriş</span>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                Her gün giriş yaparak hediyeni topla, mağaza bütçene +150 Coin ekle!
              </p>
            </div>

            <button
              onClick={handleClaimDailyBonus}
              disabled={!!dailyCountdown}
              className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono transition-all uppercase ${
                dailyCountdown
                  ? 'bg-slate-900 text-slate-500 border border-slate-800/60 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer font-black'
              }`}
            >
              {dailyCountdown ? dailyCountdown : 'Ödülü Topla'}
            </button>

            {dailyClaimMsg && (
              <div className="absolute inset-x-4 bottom-4 bg-emerald-950 border border-emerald-800 text-emerald-300 text-[11px] p-2 rounded-xl animate-fade-in font-medium">
                {dailyClaimMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right widget column: Live Cup Feed (Canlı Kupa Akışı) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-pink-500 animate-pulse" />
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-extrabold">
                CANLI YAYIN AKIŞI (LIVE FEED)
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">CANLI</span>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 shadow-inner">
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {liveFeed.map((feed) => (
                <div
                  key={feed.id}
                  className="flex items-start justify-between gap-4 py-2 border-b border-slate-900/40 last:border-0 animate-fade-in"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">{feed.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0 pt-0.5 font-mono">
                    {feed.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
