/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { getUsers, registerUser } from '../utils/db';
import { createVerificationInFirestore, verifyCodeInFirestore } from '../utils/firestore-sync';
import { UserPlus, LogIn, User, Gamepad2, Sparkles, ShieldCheck, Mail, KeyRound, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface RegisterViewProps {
  onLoginSuccess: (user: Player) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Email verification state flow
  const [verificationStep, setVerificationStep] = useState<'form' | 'verify'>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');
  const [pendingType, setPendingType] = useState<'register' | 'login'>('register');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // For quick-login select menu or login input
  const [loginUsername, setLoginUsername] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    const trimmedEmail = email.trim();

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

    if (!trimmedEmail) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      setError('Lütfen geçerli bir e-posta formatı girin (Örn: isim@mail.com).');
      return;
    }

    // Check if user already exists
    const users = getUsers();
    const exists = users.some(u => u.username.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setError('Bu kullanıcı adı zaten alınmış. Giriş Yap sekmesini kullanabilirsiniz.');
      return;
    }

    const emailExists = users.some(u => u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (emailExists) {
      setError('Bu e-posta adresi ile zaten kayıt olunmuş. Giriş Yap sekmesini kullanabilirsiniz.');
      return;
    }

    try {
      setIsSendingCode(true);
      const code = await createVerificationInFirestore(trimmedEmail, trimmed, 'register');
      setSentCode(code);
      setPendingEmail(trimmedEmail);
      setPendingUsername(trimmed);
      setPendingType('register');
      setVerificationStep('verify');
    } catch (err) {
      setError('Doğrulama kodu e-postaya gönderilirken hata oluştu.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = loginUsername.trim();
    if (!trimmed) {
      setError('Lütfen kullanıcı adınızı veya e-postanızı girin.');
      return;
    }

    const users = getUsers();
    const found = users.find(u => 
      !u.isBot && 
      (u.username.toLowerCase() === trimmed.toLowerCase() || (u.email && u.email.toLowerCase() === trimmed.toLowerCase()))
    );

    if (!found) {
      setError('Kullanıcı bulunamadı. Lütfen doğru yazdığınızdan emin olun veya Kayıt Olun.');
      return;
    }

    const targetEmail = found.email || `${found.username.toLowerCase()}@pisti.game`;

    try {
      setIsSendingCode(true);
      const code = await createVerificationInFirestore(targetEmail, found.username, 'login');
      setSentCode(code);
      setPendingEmail(targetEmail);
      setPendingUsername(found.username);
      setPendingType('login');
      setVerificationStep('verify');
    } catch (err) {
      setError('Giriş kodu gönderilirken hata oluştu.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = verificationCode.trim();
    if (trimmedCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    try {
      const isVerified = await verifyCodeInFirestore(pendingEmail, trimmedCode);
      if (!isVerified) {
        setError('Doğrulama kodu yanlış veya süresi dolmuş (5 dk). Lütfen tekrar deneyin.');
        return;
      }

      // Success! Perform registration or login
      if (pendingType === 'register') {
        const newUser = registerUser(pendingUsername, pendingEmail);
        onLoginSuccess(newUser);
      } else {
        const users = getUsers();
        const found = users.find(u => 
          !u.isBot && 
          (u.username.toLowerCase() === pendingUsername.toLowerCase() || (u.email && u.email.toLowerCase() === pendingEmail.toLowerCase()))
        );
        if (found) {
          localStorage.setItem('pisti_current_user_id', found.id);
          onLoginSuccess(found);
        } else {
          setError('Kullanıcı kaydı tamamlanamadı.');
        }
      }
    } catch (err) {
      setError('Doğrulama esnasında bir hata oluştu.');
    }
  };

  const handleSelectPredefined = async (player: Player) => {
    setError(null);
    const targetEmail = player.email || `${player.username.toLowerCase()}@pisti.game`;
    try {
      setIsSendingCode(true);
      const code = await createVerificationInFirestore(targetEmail, player.username, 'login');
      setSentCode(code);
      setPendingEmail(targetEmail);
      setPendingUsername(player.username);
      setPendingType('login');
      setVerificationStep('verify');
    } catch (err) {
      setError('Giriş kodu gönderilirken hata oluştu.');
    } finally {
      setIsSendingCode(false);
    }
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

        {/* Tab Toggle - Only show if verificationStep is 'form' */}
        {verificationStep === 'form' && (
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
        )}

        {/* Errors display */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-300 text-xs rounded-xl text-center font-mono animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* Loading code indicator */}
        {isSendingCode && (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-slate-400">Doğrulama kodu oluşturuluyor...</span>
          </div>
        )}

        {/* Form area based on step */}
        {!isSendingCode && (
          verificationStep === 'verify' ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center space-y-1.5 pb-2">
                <div className="inline-flex p-2 bg-indigo-950/80 border border-cyan-500/30 rounded-xl mb-1">
                  <KeyRound className="w-5 h-5 text-cyan-400 animate-bounce" />
                </div>
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
                  E-POSTA DOĞRULAMASI
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Lütfen <span className="text-cyan-400 font-bold">{pendingEmail}</span> adresine gönderilen 6 haneli kodu girin.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block text-center">
                  6 HANELİ DOĞRULAMA KODU
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="------"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Developer/User Simulation Inbox Interception Panel */}
              <div className="p-3 bg-indigo-950/30 border border-indigo-900/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    E-Posta Servisi (Simüle Panel)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-mono">
                  E-Posta sunucusu doğrulama kodunu başarıyla oluşturdu. Lütfen aşağıdaki kodu girerek doğrulamayı tamamlayın:
                </p>
                <div className="bg-slate-950/80 border border-slate-900 px-3 py-2 rounded-xl text-center">
                  <span className="text-xs font-mono font-extrabold text-amber-400 uppercase">
                    KOD: <span className="text-lg text-glow-cyan tracking-widest ml-1">{sentCode}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-95 text-slate-950 font-display font-black tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <CheckCircle size={14} /> DOĞRULA VE GİRİŞ YAP
                </button>
                <button
                  type="button"
                  onClick={() => { setVerificationStep('form'); setError(null); setVerificationCode(''); }}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-mono py-2.5 rounded-xl transition-all cursor-pointer animate-pulse"
                >
                  İptal Et & Geri Dön
                </button>
              </div>
            </form>
          ) : (
            activeTab === 'register' ? (
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

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    E-POSTA ADRESİ (EMAIL)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      placeholder="E-posta adresinizi girin..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
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
                  KAYIT KODU GÖNDER
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                    KULLANICI ADI VEYA E-POSTA
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Kullanıcı adınız veya e-posta..."
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                      maxLength={50}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-slate-950 font-display font-black tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer"
                >
                  GİRİŞ KODU GÖNDER
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
            )
          )
        )}

        <div className="text-center pt-2">
          <span className="text-[9px] font-mono text-slate-600 flex items-center justify-center gap-1">
            <ShieldCheck size={10} className="text-indigo-500/60" /> SECURE ONLINE FIRESTORE AUTH • NO PASSWORD REQUIRED
          </span>
        </div>

      </div>
    </div>
  );
};
