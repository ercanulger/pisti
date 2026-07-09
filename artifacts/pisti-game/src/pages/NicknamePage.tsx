import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks';
import { firestoreHelpers } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';

export default function NicknamePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname.length < 3 || nickname.length > 15) {
      toast({ title: 'Hata', description: 'Kullanıcı adı 3-15 karakter olmalıdır.', variant: 'destructive' });
      return;
    }
    
    // Alphanumeric only
    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
      toast({ title: 'Hata', description: 'Sadece harf, rakam ve alt çizgi kullanabilirsiniz.', variant: 'destructive' });
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      const isTaken = await firestoreHelpers.isNicknameTaken(nickname);
      if (isTaken) {
        toast({ title: 'Hata', description: 'Bu kullanıcı adı zaten alınmış.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const isAdmin = nickname.trim().toLowerCase() === 'ercanulger';
      await firestoreHelpers.updateUserProfile(user.uid, { nickname, isAdmin });
      await refreshProfile();
      toast({ title: 'Başarılı', description: 'Kullanıcı adınız kaydedildi.' });
      setLocation('/');
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Kullanıcı Adı Seçin</CardTitle>
          <CardDescription>Diğer oyuncular sizi bu isimle görecek.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Örn: PiştiKralı58"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={15}
                className="text-center text-lg h-12"
              />
            </div>
            
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
              Devam Et
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
