import { useRoute } from 'wouter';
import { usePublicProfile } from '@/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { AdminBadge } from '@/components/common/AdminBadge';

export default function PublicProfilePage() {
  const [, params] = useRoute('/profile/:uid');
  const uid = params?.uid;
  
  const { profile, loading } = usePublicProfile(uid || '');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Kullanıcı Bulunamadı</h2>
        <p className="text-muted-foreground mb-6">Bu profil mevcut değil veya silinmiş.</p>
        <Link href="/leaderboard"><Button variant="outline">Geri Dön</Button></Link>
      </div>
    );
  }

  const winRate = profile.gamesPlayed > 0 
    ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-20">
      <Link href="/leaderboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Liderlik Tablosuna Dön
      </Link>

      <Card className="border-primary/20 relative overflow-hidden">
        {profile.activeTable && (
           <div className={`absolute inset-0 opacity-20 ${profile.activeTable}`} />
        )}
        <CardContent className="pt-8 pb-8 flex flex-col items-center relative z-10">
          
          <div className="relative mb-4">
            <div className={`absolute inset-0 rounded-full ${profile.activeFrame || ''} opacity-50 blur-sm`} />
            <Avatar className={`w-28 h-28 border-4 border-background shadow-xl ${profile.activeFrame || ''}`}>
              <AvatarImage src={profile.photoBase64 || ''} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold bg-primary/20">
                {profile.nickname?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-2xl font-bold flex items-center">
            {profile.nickname}
            {profile.isAdmin && <AdminBadge className="ml-2" />}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Oyuncu Profili
          </p>
          
          <div className="flex gap-4 mt-6">
            <div className="flex items-center space-x-1 px-5 py-2 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
              <Trophy className="w-5 h-5 mr-1" />
              <span className="font-bold text-lg">{profile.trophies}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="text-muted-foreground text-xs uppercase">Oynanan</div>
            <div className="text-2xl font-bold">{profile.gamesPlayed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <div className="text-muted-foreground text-xs uppercase">Kazanılan</div>
            <div className="text-2xl font-bold text-primary">{profile.gamesWon}</div>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4 text-center space-y-1 flex justify-between items-center">
            <span className="text-muted-foreground text-sm uppercase">Kazanma Oranı</span>
            <span className="text-2xl font-bold text-accent">%{winRate}</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
