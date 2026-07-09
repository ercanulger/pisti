import React from 'react';
import { useLeaderboard } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Loader2, Medal } from 'lucide-react';
import { Link } from 'wouter';
import { AdminBadge } from '@/components/common/AdminBadge';

export default function LeaderboardPage() {
  const { leaders, loading } = useLeaderboard();

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4 pt-8 pb-20">
      <div className="text-center mb-6">
        <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-2" />
        <h1 className="text-3xl font-serif font-bold text-primary">Liderlik</h1>
        <p className="text-muted-foreground text-sm">En iyi oyuncular sıralaması</p>
      </div>

      <div className="space-y-3">
        {leaders.map((user, index) => {
          const isTop3 = index < 3;
          let rankColor = "text-muted-foreground";
          let medalIcon = null;
          
          if (index === 0) {
            rankColor = "text-yellow-500";
            medalIcon = <Medal className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />;
          } else if (index === 1) {
            rankColor = "text-gray-400";
            medalIcon = <Medal className="w-6 h-6 text-gray-400 fill-gray-400/20" />;
          } else if (index === 2) {
            rankColor = "text-amber-700";
            medalIcon = <Medal className="w-6 h-6 text-amber-700 fill-amber-700/20" />;
          }

          return (
            <Link key={user.uid} href={`/profile/${user.uid}`}>
              <Card className={`overflow-hidden transition-colors hover:bg-muted/50 ${isTop3 ? 'border-primary/30 shadow-md' : 'border-border/50'}`}>
                <CardContent className="p-3 flex items-center space-x-4">
                  <div className={`w-8 font-black text-xl text-center ${rankColor}`}>
                    {medalIcon || `#${index + 1}`}
                  </div>
                  
                  <Avatar className={`w-12 h-12 border-2 ${isTop3 ? 'border-primary' : 'border-border'}`}>
                    <AvatarImage src={user.photoBase64 || ''} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                      {user.nickname?.substring(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center truncate">
                      {user.nickname}
                      {user.isAdmin && <AdminBadge className="ml-2 shrink-0" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      %{(user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) * 100 : 0).toFixed(0)} Kazanma
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-orange-500 font-bold bg-orange-500/10 px-3 py-1 rounded-full">
                    <Trophy className="w-4 h-4" />
                    <span>{user.trophies}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {leaders.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            Henüz sıralama oluşmadı.
          </div>
        )}
      </div>
    </div>
  );
}
