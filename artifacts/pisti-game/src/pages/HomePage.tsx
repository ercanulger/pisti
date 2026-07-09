import React from 'react';
import { useAuth } from '@/hooks';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, Coins, Trophy, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { firestoreHelpers, GameHistory } from '@/lib/firestore';
import { AdminBadge } from '@/components/common/AdminBadge';

export default function HomePage() {
  const { profile } = useAuth();
  const [recentGames, setRecentGames] = React.useState<GameHistory[]>([]);

  React.useEffect(() => {
    if (profile?.uid) {
      firestoreHelpers.getRecentGames(profile.uid, 3).then(setRecentGames);
    }
  }, [profile?.uid]);

  if (!profile) return null;

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8">
      {/* Header Profile Summary */}
      <div className="flex items-center space-x-4 mb-8">
        <Avatar className="w-16 h-16 border-2 border-primary">
          <AvatarImage src={profile.photoBase64 || ''} />
          <AvatarFallback className="bg-primary/20 text-xl font-bold">
            {profile.nickname?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {profile.nickname}
            {profile.isAdmin && <AdminBadge className="ml-2" />}
          </h1>
          <div className="flex space-x-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center text-yellow-500 font-semibold"><Coins className="w-4 h-4 mr-1" /> {profile.coins}</span>
            <span className="flex items-center text-orange-500 font-semibold"><Trophy className="w-4 h-4 mr-1" /> {profile.trophies}</span>
          </div>
        </div>
      </div>

      {/* Main Action */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />
        <Link href="/game" className="relative block">
          <Button className="w-full h-24 text-2xl font-bold font-serif rounded-2xl bg-card hover:bg-card/90 text-foreground border-2 border-primary/50 shadow-xl flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            OYUNA BAŞLA
          </Button>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-primary">{profile.gamesPlayed}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Oynanan Maç</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-3xl font-bold text-accent">{profile.gamesWon}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Kazanılan Maç</span>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Son Oyunlar
        </h3>
        {recentGames.length === 0 ? (
          <div className="text-center p-6 bg-card/30 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Henüz oyun oynamadınız. İlk oyununuza başlayın!
          </div>
        ) : (
          <div className="space-y-2">
            {recentGames.map((game, i) => (
              <div key={game.id || i} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${game.result === 'win' ? 'bg-green-500' : game.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <div className="font-semibold">{game.result === 'win' ? 'Galibiyet' : game.result === 'loss' ? 'Mağlubiyet' : 'Beraberlik'}</div>
                    <div className="text-xs text-muted-foreground">Skor: {game.score} | Pişti: {game.pistiCount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500 font-bold text-sm">+{game.coinsEarned} <Coins className="w-3 h-3 inline" /></div>
                  {game.trophiesEarned > 0 && (
                    <div className="text-orange-500 font-bold text-xs">+{game.trophiesEarned} <Trophy className="w-3 h-3 inline" /></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
