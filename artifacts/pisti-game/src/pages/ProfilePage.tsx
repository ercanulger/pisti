import React, { useRef, useState } from 'react';
import { useAuth } from '@/hooks';
import { firestoreHelpers } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Upload, Trophy, Coins } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { AdminBadge } from '@/components/common/AdminBadge';

export default function ProfilePage() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!profile) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64
      toast({ title: 'Hata', description: 'Dosya boyutu çok büyük (Max 2MB)', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        await firestoreHelpers.updateUserProfile(profile.uid, { photoBase64: base64 });
        await refreshProfile();
        toast({ title: 'Başarılı', description: 'Profil fotoğrafı güncellendi.' });
      } catch (error) {
        toast({ title: 'Hata', description: 'Fotoğraf yüklenemedi.', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const winRate = profile.gamesPlayed > 0 
    ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-20">
      <Card className="border-primary/20 relative overflow-hidden">
        {profile.activeTable && (
           <div className={`absolute inset-0 opacity-20 ${profile.activeTable}`} />
        )}
        <CardContent className="pt-8 pb-8 flex flex-col items-center relative z-10">
          
          <div className="relative group mb-4">
            <div className={`absolute inset-0 rounded-full ${profile.activeFrame || ''} opacity-50 blur-sm`} />
            <Avatar className={`w-28 h-28 border-4 border-background shadow-xl ${profile.activeFrame || ''}`}>
              <AvatarImage src={profile.photoBase64 || ''} className="object-cover" />
              <AvatarFallback className="text-3xl font-bold bg-primary/20">
                {profile.nickname?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
            />
          </div>

          <h2 className="text-2xl font-bold flex items-center">
            {profile.nickname}
            {profile.isAdmin && <AdminBadge className="ml-2" />}
          </h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          
          <div className="flex gap-4 mt-6">
            <div className="flex items-center space-x-1 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">
              <Coins className="w-5 h-5" />
              <span className="font-bold">{profile.coins}</span>
            </div>
            <div className="flex items-center space-x-1 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{profile.trophies}</span>
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

      <Button variant="destructive" className="w-full mt-8" onClick={signOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Çıkış Yap
      </Button>
    </div>
  );
}
