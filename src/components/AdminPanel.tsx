/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, AuditLog, UserRole } from '../types';
import { getUsers, getAuditLogs, writeAuditLog, updateUserCoinsAndElo, sendPasswordResetEmail, getUserRoles } from '../utils/db';
import { Shield, Users, History, Key, Settings, Coins, Mail, LogOut, ArrowRight, Check } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
  currentUser: Player;
  onRefreshUser: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, currentUser, onRefreshUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard States
  const [activeTab, setActiveTab] = useState<'users' | 'audit_logs'>('users');
  const [userList, setUserList] = useState<Player[]>(() => getUsers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());

  // Edit Coin states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(100);
  const [coinSuccess, setCoinSuccess] = useState<string | null>(null);

  // Email Reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === 'admin58') {
      setIsAuthenticated(true);
      setLoginError('');
      // Log login success
      writeAuditLog(currentUser.id, 'ADMIN_LOGIN', 'Admin paneline giriş sağlandı.');
      setAuditLogs(getAuditLogs());
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre (admin/admin58).');
    }
  };

  const handleAddCoins = (userId: string) => {
    if (coinAmount <= 0) return;
    
    const userToEdit = userList.find(u => u.id === userId);
    if (!userToEdit) return;

    // Update DB
    updateUserCoinsAndElo(userId, coinAmount, 0);
    
    // Log action
    writeAuditLog(
      currentUser.id,
      'COIN_GRANT',
      `Kullanıcı ${userToEdit.username} hesabına +${coinAmount} Coin yüklendi.`
    );

    // Refresh Local state
    setUserList(getUsers());
    setAuditLogs(getAuditLogs());
    onRefreshUser();

    setCoinSuccess(`Kullanıcıya ${coinAmount} Coin başarıyla tanımlandı!`);
    setTimeout(() => {
      setCoinSuccess(null);
      setSelectedUserId(null);
    }, 3000);
  };

  const handleTriggerPasswordReset = async (username: string, email: string) => {
    if (!email) {
      alert('Lütfen geçerli bir e-posta adresi yazın!');
      return;
    }
    setResetLoading(true);
    setResetSuccess(null);

    const res = await sendPasswordResetEmail(email, username);
    setResetLoading(false);
    
    if (res.success) {
      setResetSuccess(res.message);
      setAuditLogs(getAuditLogs());
      setTimeout(() => setResetSuccess(null), 8000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        {/* Glowing visual backdrops */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <div className="w-12 h-12 bg-red-950/50 border border-red-500/30 text-rose-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Shield size={24} className="animate-pulse" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-slate-100 tracking-tight mt-2">
              pisti.game Yönetim Paneli
            </h2>
            <p className="text-xs text-slate-400">
              Yönetici kimlik bilgilerinizi girerek kontrol paneline erişin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-bold">Kullanıcı Adı</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Örn: admin"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-bold">Şifre</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            {loginError && (
              <p className="text-[11px] text-rose-400 font-medium font-mono text-center">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-slate-100 text-xs md:text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all"
            >
              Giriş Yap <ArrowRight size={14} />
            </button>
          </form>

          <button
            onClick={onClose}
            className="w-full mt-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-[11px] py-1.5 rounded-xl cursor-pointer transition-colors"
          >
            Vazgeç ve Oyuna Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Admin Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-rose-500" />
          <span className="text-sm font-display font-bold tracking-tight text-slate-200">pisti.game // KONTROL PANELİ</span>
          <span className="text-[9px] bg-red-950/40 border border-red-500/30 text-rose-400 font-mono px-2 py-0.5 rounded-full uppercase font-bold tracking-wider animate-pulse">
            ADMIN MODU
          </span>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
        >
          <LogOut size={12} />
          <span>ÇIKIŞ YAP</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-56 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-900 p-4 space-y-2 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer ${
              activeTab === 'users'
                ? 'bg-rose-950/30 border border-rose-800/50 text-rose-400'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            <span>Kullanıcı Listesi</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all select-none cursor-pointer ${
              activeTab === 'audit_logs'
                ? 'bg-rose-950/30 border border-rose-800/50 text-rose-400'
                : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
            }`}
          >
            <History size={16} />
            <span>Audit Logs (Denetim)</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          
          {coinSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs md:text-sm p-3 rounded-xl mb-6 font-medium animate-fade-in flex items-center gap-1.5">
              <Check size={16} className="text-emerald-400 animate-bounce" />
              <span>{coinSuccess}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-xs md:text-sm p-3.5 rounded-xl mb-6 font-medium animate-fade-in">
              🚀 {resetSuccess}
            </div>
          )}

          {/* TAB 1: USERS LIST */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-100 flex items-center gap-2">
                    <Users size={18} className="text-rose-500" />
                    KULLANICI VERİ TABANI
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kullanıcılar, botlar ve özel yetkili (ercanulger) durumları normalize edilmiş şekilde listelenir.
                  </p>
                </div>
              </div>

              {/* Users table */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40">
                        <th className="px-4 py-3.5 text-left text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Kullanıcı</th>
                        <th className="px-4 py-3.5 text-left text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Rol</th>
                        <th className="px-4 py-3.5 text-center text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Elo (Kupa)</th>
                        <th className="px-4 py-3.5 text-center text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">Coin Bakiye</th>
                        <th className="px-4 py-3.5 text-right text-xs font-mono text-slate-500 font-bold uppercase tracking-wider w-48">Hızlı İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {userList.map((user) => {
                        const isUserAdmin = user.id === 'user_ercanulger';
                        
                        return (
                          <tr key={user.id} className="hover:bg-slate-950/20 transition-colors">
                            {/* User details */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={user.avatarUrl}
                                  alt={user.username}
                                  className="w-8 h-8 rounded-full border border-slate-700 p-0.5 bg-slate-900"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-200 font-mono">{user.username}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {user.isBot ? `Robot (${user.botLevel})` : 'Gerçek Oyuncu'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Role badge */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {isUserAdmin ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold font-mono bg-red-950 text-red-400 border border-red-800/50">
                                  ADMIN / KURUCU
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold font-mono bg-slate-950 text-slate-400 border border-slate-800/80">
                                  OYUNCU
                                </span>
                              )}
                            </td>

                            {/* Elo */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-center text-xs font-mono font-bold text-slate-200">
                              {user.elo}
                            </td>

                            {/* Coins */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-center text-xs font-mono font-bold text-yellow-500">
                              {user.coins}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Coin edit button */}
                                <button
                                  onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                                  className="p-1.5 bg-slate-950 hover:bg-amber-950/20 border border-slate-800 hover:border-amber-900/50 text-amber-500 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all flex items-center gap-1"
                                  title="Coin Tanımla"
                                >
                                  <Coins size={12} />
                                  <span className="text-[10px]">Coin</span>
                                </button>

                                {/* Resend Reset Email (Mock or Real) */}
                                {!user.isBot && (
                                  <button
                                    onClick={() => handleTriggerPasswordReset(user.username, 'retrokronik@gmail.com')}
                                    disabled={resetLoading}
                                    className="p-1.5 bg-slate-950 hover:bg-cyan-950/20 border border-slate-800 hover:border-cyan-900/50 text-cyan-400 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all flex items-center gap-1 disabled:opacity-50"
                                    title="Resend ile Şifre Sıfırlama E-postası Gönder"
                                  >
                                    <Mail size={12} />
                                    <span className="text-[10px]">{resetLoading ? '...' : 'Sıfırla'}</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coin Drawer modal input */}
              {selectedUserId && (
                <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 md:p-5 max-w-md animate-fade-in">
                  <h4 className="text-xs md:text-sm font-display font-extrabold text-amber-400 flex items-center gap-1.5 mb-2">
                    <Coins size={14} />
                    Coin Tanımlama Formu (Bakiye Yönetimi)
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-4">
                    Seçili kullanıcının cüzdanına eklenecek coin miktarını belirtin.
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 w-28 focus:outline-none"
                    />

                    <button
                      onClick={() => handleAddCoins(selectedUserId)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-1.5 rounded-xl cursor-pointer select-none transition-all"
                    >
                      Bakiyeyi Güncelle
                    </button>
                    
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="text-slate-500 hover:text-slate-300 text-xs py-1"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-base font-display font-extrabold text-slate-100 flex items-center gap-2">
                  <History size={18} className="text-rose-500" />
                  DENETİM LOGLARI (AUDIT_LOG TABLOSU)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Yönetici eylemleri, coin transferleri, şifre sıfırlama talepleri ve sistem olayları kronolojik olarak loglanır.
                </p>
              </div>

              {/* Logs display list */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800 font-mono">
                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">Henüz bir denetim logu kaydedilmemiş.</div>
                  ) : (
                    auditLogs.map((log) => {
                      const formattedDate = new Date(log.timestamp).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      });

                      let actionColor = 'text-slate-400';
                      if (log.action === 'COIN_GRANT') actionColor = 'text-amber-400 font-bold';
                      else if (log.action === 'ADMIN_LOGIN') actionColor = 'text-rose-400';
                      else if (log.action === 'PASSWORD_RESET') actionColor = 'text-cyan-400 font-bold';
                      else if (log.action === 'SHOP_PURCHASE') actionColor = 'text-indigo-400';

                      return (
                        <div key={log.id} className="p-4 hover:bg-slate-950/10 text-xs leading-relaxed flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-500 text-[10px]">{formattedDate}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800/80 ${actionColor}`}>
                                {log.action}
                              </span>
                              <span className="text-slate-400 text-[10px]">Tarafından: {log.userId}</span>
                            </div>
                            <p className="text-slate-300 font-sans text-xs pt-0.5">{log.details}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
