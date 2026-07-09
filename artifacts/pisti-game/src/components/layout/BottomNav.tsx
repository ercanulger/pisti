import React from 'react';
import { Link, useLocation } from 'wouter';
import { Gamepad2, Store, User, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: Gamepad2, label: 'Oyna' },
    { href: '/store', icon: Store, label: 'Mağaza' },
    { href: '/leaderboard', icon: Trophy, label: 'Liderlik' },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = location === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
