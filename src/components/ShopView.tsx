/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, ShopItem, UserInventory } from '../types';
import { buyShopItem, DEFAULT_SHOP_ITEMS, updateCurrentUser, getUserInventory, writeAuditLog } from '../utils/db';
import { ShoppingBag, Sparkles, Check, Flame, Coins, Eye } from 'lucide-react';

interface ShopViewProps {
  currentUser: Player;
  onRefreshUser: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ currentUser, onRefreshUser }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'frame' | 'font' | 'color' | 'badge'>('all');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Get user inventory
  const inventory = getUserInventory(currentUser.id);
  
  // Filter items by category
  const filteredItems = DEFAULT_SHOP_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  const handlePurchaseOrEquip = (item: ShopItem) => {
    setMessage(null);
    const isOwned = inventory.some((inv) => inv.itemId === item.id);

    if (isOwned) {
      // Equip/Unequip logic
      let updatedFields: Partial<Player> = {};
      
      if (item.type === 'frame') {
        updatedFields.selectedFrame = currentUser.selectedFrame === item.id ? undefined : item.id;
      } else if (item.type === 'font') {
        updatedFields.selectedFont = currentUser.selectedFont === item.id ? undefined : item.id;
      } else if (item.type === 'color') {
        updatedFields.selectedColor = currentUser.selectedColor === item.id ? undefined : item.id;
      } else if (item.type === 'badge') {
        updatedFields.selectedBadge = currentUser.selectedBadge === item.id ? undefined : item.id;
      }

      updateCurrentUser(updatedFields);
      onRefreshUser();
      
      const actionText = updatedFields[Object.keys(updatedFields)[0] as keyof Partial<Player>] 
        ? `'${item.name}' kuşanıldı!` 
        : `'${item.name}' çıkarıldı!`;
        
      setMessage({ text: actionText, isError: false });
    } else {
      // Buy logic
      const result = buyShopItem(currentUser.id, item);
      if (result.success) {
        onRefreshUser();
        setMessage({ text: `'${item.name}' başarıyla satın alındı ve kuşanmaya hazır!`, isError: false });
      } else {
        setMessage({ text: result.error || 'Satın alma başarısız oldu.', isError: true });
      }
    }

    // Auto-clear message after 3 seconds
    setTimeout(() => setMessage(null), 4000);
  };

  const isEquipped = (item: ShopItem) => {
    if (item.type === 'frame') return currentUser.selectedFrame === item.id;
    if (item.type === 'font') return currentUser.selectedFont === item.id;
    if (item.type === 'color') return currentUser.selectedColor === item.id;
    if (item.type === 'badge') return currentUser.selectedBadge === item.id;
    return false;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-950 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-3 font-mono">
            <Sparkles size={12} className="text-yellow-400" />
            ÖZEL RGB & ÖZELLEŞTİRME MAĞAZASI
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-100 tracking-tight">
            PROFILINI CANLANDIR
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1.5 leading-relaxed">
            Kazanılan coinleri kullanarak özel RGB çerçeveler, lüks yazı tipleri, neon takma ad renkleri ve prestij rozetleri satın al.
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-slate-900 mb-6">
        {[
          { id: 'all', label: 'Tüm Eşyalar' },
          { id: 'frame', label: 'RGB Çerçeveler' },
          { id: 'font', label: 'Özel Fontlar' },
          { id: 'color', label: 'Nick Renkleri' },
          { id: 'badge', label: 'Rozetler' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 border-indigo-500 text-slate-100 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-3.5 mb-6 rounded-xl border text-xs md:text-sm font-medium animate-fade-in ${
            message.isError
              ? 'bg-red-950/40 border-red-800 text-red-300'
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Shop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isOwned = inventory.some((inv) => inv.itemId === item.id);
          const equipped = isEquipped(item);

          return (
            <div
              key={item.id}
              className={`relative bg-slate-950/50 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] ${
                equipped
                  ? 'border-indigo-500 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'border-slate-900/80 hover:border-slate-800 hover:bg-slate-900/10'
              }`}
            >
              {/* Item Type Tag */}
              <div className="absolute top-3 right-3 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">
                {item.type}
              </div>

              {/* Item Visual Preview Container */}
              <div className="bg-slate-950 border border-slate-900/60 rounded-xl p-4 flex flex-col items-center justify-center mb-5 min-h-[110px] relative">
                {item.type === 'frame' && (
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full overflow-hidden p-0.5 ${item.value}`}>
                      <img
                        src={currentUser.avatarUrl}
                        alt="Preview"
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}

                {item.type === 'font' && (
                  <div className="text-center">
                    <span className={`text-lg block mb-1 ${item.value} text-slate-200`}>
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Font Stil Önizlemesi</span>
                  </div>
                )}

                {item.type === 'color' && (
                  <div className="text-center">
                    <span className={`text-lg block mb-1 ${item.value}`}>
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Nick Renk Önizlemesi</span>
                  </div>
                )}

                {item.type === 'badge' && (
                  <div className="text-center flex flex-col items-center gap-1.5">
                    <span className="bg-indigo-950 border border-indigo-500/30 px-2 py-0.5 rounded text-xs text-indigo-300 font-mono flex items-center gap-1">
                      {item.badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Rozet Önizlemesi</span>
                  </div>
                )}

                {/* Cyberpunk lighting backdrop */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/10 to-transparent pointer-events-none rounded-xl" />
              </div>

              {/* Text detail */}
              <div>
                <h3 className="text-sm font-display font-bold text-slate-100 flex items-center gap-1.5">
                  {item.name}
                  {isOwned && (
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full font-sans">
                      SAHİPSİN
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed min-h-[36px]">
                  {item.description}
                </p>
              </div>

              {/* Action buttons with Pricing matrix */}
              <div className="mt-5 border-t border-slate-900 pt-4 flex items-center justify-between gap-3">
                {/* Cost / Owner status label */}
                {!isOwned ? (
                  <div className="flex items-center gap-1 bg-amber-950/20 border border-amber-900/30 px-2.5 py-1 rounded-lg">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-sm font-mono font-bold text-yellow-500">{item.price}</span>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[10px] font-mono flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <Check size={12} className="text-emerald-400" /> Envanterde
                  </div>
                )}

                {/* Purchase or Equip Button */}
                <button
                  onClick={() => handlePurchaseOrEquip(item)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 select-none cursor-pointer ${
                    equipped
                      ? 'bg-red-950/60 border border-red-800 text-red-400 hover:bg-red-900/40'
                      : isOwned
                      ? 'bg-indigo-600 border border-indigo-500 text-slate-100 hover:bg-indigo-500 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                      : 'bg-amber-500 border border-amber-400 text-slate-950 hover:bg-amber-400 hover:shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {equipped ? 'Çıkar' : isOwned ? 'Kuşan' : 'Satın Al'}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
