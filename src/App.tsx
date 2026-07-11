/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Player, MatchHistory, TabType } from './types';
import { initializeDB, getCurrentUser, isUserAdmin, getUsers } from './utils/db';
import { TopPanel } from './components/TopPanel';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { LeaderboardView } from './components/LeaderboardView';
import { ShopView } from './components/ShopView';
import { QuestsView } from './components/QuestsView';
import { ProfileView } from './components/ProfileView';
import { GameScreen } from './components/GameScreen';
import { AdminPanel } from './components/AdminPanel';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { RegisterView } from './components/RegisterView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('pisti_theme') as 'dark' | 'light') || 'dark';
  });

  // Active game play states
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeGameMode, setActiveGameMode] = useState<'tekli' | 'esli' | 'ozel'>('tekli');
  const [summaryMatch, setSummaryMatch] = useState<MatchHistory | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    initializeDB();
    refreshUserData();
    setIsLoaded(true);
  }, []);

  const refreshUserData = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setAllPlayers(getUsers());
    
    if (user) {
      setIsAdmin(isUserAdmin(user.id) || user.username === 'ercanulger');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('pisti_theme', nextTheme);
  };

  const handleStartGame = (mode: 'tekli' | 'esli' | 'ozel') => {
    setActiveGameMode(mode);
    setIsPlaying(true);
  };

  const handleMatchFinished = (historyItem: MatchHistory) => {
    setSummaryMatch(historyItem);
    setIsPlaying(false);
    refreshUserData();
  };

  const handleCloseSummary = () => {
    setSummaryMatch(null);
    setActiveTab('profile'); // Send user to profile to see the results and stats
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-t-cyan-400 border-r-transparent border-slate-800 rounded-full animate-spin" />
          <span>Veritabanı Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
        <RegisterView onLoginSuccess={(user) => {
          setCurrentUser(user);
          setAllPlayers(getUsers());
          setIsAdmin(isUserAdmin(user.id) || user.username === 'ercanulger');
        }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 relative select-none overflow-x-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-cyber-dark text-slate-100 dark-mode' : 'bg-slate-50 text-slate-900 light-mode'
    }`}>
      
      {/* 1. Header Navigation Bar */}
      {!isPlaying && (
        <TopPanel
          user={currentUser}
          isAdmin={isAdmin}
          onOpenAdmin={() => setIsAdminOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* 2. Primary Layout Renderers */}
      <main className="max-w-7xl mx-auto py-2">
        {isPlaying ? (
          <GameScreen
            currentUser={currentUser}
            gameMode={activeGameMode}
            onQuit={() => setIsPlaying(false)}
            onMatchFinished={handleMatchFinished}
          />
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'home' && (
              <DashboardView
                currentUser={currentUser}
                onRefreshUser={refreshUserData}
                onStartGame={handleStartGame}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView
                players={allPlayers}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'shop' && (
              <ShopView
                currentUser={currentUser}
                onRefreshUser={refreshUserData}
              />
            )}

            {activeTab === 'quests' && (
              <QuestsView
                onRefreshUser={refreshUserData}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                onRefreshUser={refreshUserData}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Sticky Bottom Navigation (Hidden in active gameplay for maximum screen real estate) */}
      {!isPlaying && (
        <BottomNavBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 4. Overlay Modals */}
      
      {/* Match Summary Modal */}
      {summaryMatch && (
        <MatchSummaryModal
          onClose={handleCloseSummary}
          historyItem={summaryMatch}
          currentUser={currentUser}
        />
      )}

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => {
            setIsAdminOpen(false);
            refreshUserData();
          }}
          currentUser={currentUser}
          onRefreshUser={refreshUserData}
        />
      )}

    </div>
  );
}
