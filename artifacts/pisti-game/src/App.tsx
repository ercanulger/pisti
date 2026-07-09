import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppShell } from '@/components/layout/AppShell';

import NotFound from '@/pages/not-found';
import AuthPage from '@/pages/AuthPage';
import NicknamePage from '@/pages/NicknamePage';
import HomePage from '@/pages/HomePage';
import GamePage from '@/pages/GamePage';
import ProfilePage from '@/pages/ProfilePage';
import PublicProfilePage from '@/pages/PublicProfilePage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import StorePage from '@/pages/StorePage';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/nickname" component={NicknamePage} />
      <Route path="/game" component={GamePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/:uid" component={PublicProfilePage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/store" component={StorePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppShell>
              <Router />
            </AppShell>
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
