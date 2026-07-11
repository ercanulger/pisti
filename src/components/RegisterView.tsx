/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { getUsers, registerUser } from '../utils/db';
import { UserPlus, LogIn, User, Gamepad2, Sparkles, ShieldCheck } from 'lucide-react';

interface RegisterViewProps {
  onLoginSuccess: (user: Player) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [error, setError] = useState<string | null>(null);

  // For quick-login select menu or login input
  const [loginUsername, setLoginUsername] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setError('Lütfen geçerli bir kullanıcı adı girin.');
      return;
    }

    if (trimmed.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    if (trimmed.length > 15) {
      setError('Kullanıcı adı en fazla 15 karakter olmalıdır.');
      return;
    }

    // Check if user already exists
    const users = getUsers();
    const exists = users.some(u => u.username.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setError('Bu kullanıcı adı zaten alınmış. Giriş Yap sekmesini kullanabilirsiniz.');
      return;
    }

    try {
      // Register new user
      const newUser = registerUser(trimmed);
      onLoginSuccess(newUser);
    } catch (err) {
      setError('Kayıt esnasında hata oluştu.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = loginUsername.trim();
    if (!trimmed) {
      setError('Lütfen kullanıcı adınızı girin.');
      return;
    }

    const users = getUsers();
    const found = users.find(u => u.username.toLowerCase() === trimmed.toLowerCase() && !u.isBot);

    if (!found) {
      setError('Kullanıcı bulunamadı. Lütfen doğru yazdığınızdan emin olun veya Kayıt Olun.');
      return;
    }

    // Set active user ID in localStorage
    localStorage.setItem('pisti_current_user_id', found.id);
    onLoginSuccess(found);
  };

  const handleSelectPredefined = (player: Player) => {
    localStorage.setItem('pisti_current_user_id', player.id);
    onLoginSuccess(player);
  };

  const existingPlayers = getUsers().filter(p => !p.isBot);

  return (
    <div className="min-h-screen bg-cyber-dark text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Cybersecurity animated elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl space-y-6">
        
        {/* Logo and Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-950 border border-indigo-500/30 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-2">
            <Gamepad2 className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-400">
            PİŞTİ ARENASI
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            CYBER-CLASSIC KART DENEYİMİNE HOŞ GELDİNİZ
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => { setActiveTab('register'); setError(null); }}
            className={`py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus size={14} />
            KAYIT OL
          </button>
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-indigo-600 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn size={14} />
            GİRİŞ YAP
          </button>
        </div>

        {/* Errors display */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-mono animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Form area */}
        {activeTab === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                KULLANICI ADI (NICKNAME)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Kullanıcı adınızı yazın..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl flex items-start gap-2.5">
              <Sparkles size={16} className="text-cyan-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-200 font-mono">200 BAŞLANGIÇ COİNİ!</span>
                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                  Kaydolduğunuz an markette harcayabileceğiniz 200 Coin ve 1000 Elo puanı hesabınıza yüklenir.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-slate-950 font-display font-black tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
            >
              HESABI YARAT VE OYNA
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                HESAP ADI
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Kayıtlı kullanıcı adınız..."
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  maxLength={15}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-slate-950 font-display font-black tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer"
            >
              GİRİŞ YAP VE ARENAYA DÖN
            </button>

            {/* Existing profiles rapid select list */}
            {existingPlayers.length > 0 && (
              <div className="pt-3 border-t border-slate-900/80 space-y-2">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block text-center">
                  CİHAZDAKİ KAYITLI HESAPLAR
                </span>
                <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {existingPlayers.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => handleSelectPredefined(player)}
                      className="bg-slate-900/40 border border-slate-800/60 hover:bg-slate-900/80 hover:border-slate-700 rounded-xl p-2 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-6 h-6 rounded-full bg-slate-950 p-0.5 border border-slate-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {player.username}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {player.elo} Elo
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}

        <div className="text-center pt-2">
          <span className="text-[9px] font-mono text-slate-600 flex items-center justify-center gap-1">
            <ShieldCheck size={10} className="text-indigo-500/60" /> SECURE LOCAL STORAGE • NO PASSWORD REQUIRED
          </span>
        </div>

      </div>
    </div>
  );
};
