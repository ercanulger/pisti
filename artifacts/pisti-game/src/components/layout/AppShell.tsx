import React, { useEffect } from 'react';
import { useLocation, Route, Switch } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from './BottomNav';
import { Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;
    
    const isAuthRoute = location === '/auth';
    
    if (!user) {
      if (!isAuthRoute) setLocation('/auth');
      return;
    }

    if (user && !user.emailVerified && !profile?.isAdmin) {
      // Strict email verification enforcement
      if (!isAuthRoute) setLocation('/auth');
      return;
    }

    if (user && profile && !profile.nickname) {
      if (location !== '/nickname') setLocation('/nickname');
      return;
    }

    if (user && profile?.nickname && isAuthRoute) {
      setLocation('/');
    }
  }, [user, profile, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Hide bottom nav on auth, nickname, and game screens
  const showBottomNav = !['/auth', '/nickname', '/game'].includes(location);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-safe pb-16">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
