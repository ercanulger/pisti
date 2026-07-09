import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Spade, Heart, Club, Diamond } from 'lucide-react';

const ADMIN_CREDENTIALS = {
  username: 'ercanulger',
  email: 'ercanulger@pistigame.com',
  password: 'admin58',
};

function normalizeLoginEmail(input: string) {
  const normalized = input.trim().toLowerCase();
  if (normalized === ADMIN_CREDENTIALS.username) {
    return ADMIN_CREDENTIALS.email;
  }
  return normalized;
}

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const loginEmail = normalizeLoginEmail(email);
        const isAdminLogin = (loginEmail === ADMIN_CREDENTIALS.email || email.trim().toLowerCase() === ADMIN_CREDENTIALS.username) && password === ADMIN_CREDENTIALS.password;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
          if (!userCredential.user.emailVerified && !isAdminLogin) {
            toast({
              title: 'E-posta Doğrulanmadı',
              description: 'Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayın.',
              variant: 'destructive',
            });
          } else {
            toast({ title: 'Giriş Başarılı', description: 'Hoş geldiniz!' });
          }
        } catch (signInError: any) {
          if (isAdminLogin && signInError?.code === 'auth/user-not-found') {
            await createUserWithEmailAndPassword(auth, ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
            toast({ title: 'Admin Hazır', description: 'Admin hesabı oluşturuldu, giriş yapıldı.' });
          } else {
            throw signInError;
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        toast({
          title: 'Kayıt Başarılı',
          description: 'E-posta adresinize doğrulama linki gönderildi. Lütfen onaylayın.',
        });
        setAuthMode('login'); // Switch to login to wait for verification
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Hata',
        description: error.message || 'Kimlik doğrulama başarısız',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: 'Hata', description: 'Lütfen e-posta adresinizi girin', variant: 'destructive' });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'Başarılı', description: 'Şifre sıfırlama bağlantısı gönderildi.' });
    } catch (error: any) {
      toast({ title: 'Hata', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 table-classic">
      <div className="mb-8 flex space-x-2 text-primary">
        <Spade className="w-8 h-8" />
        <Heart className="w-8 h-8 text-destructive" />
        <Club className="w-8 h-8" />
        <Diamond className="w-8 h-8 text-destructive" />
      </div>
      
      <Card className="w-full max-w-md border-primary/20 shadow-xl bg-card/95 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif text-primary mb-2">Pişti Online</CardTitle>
          <CardDescription>Gerçek masa hissi, çevrimiçi rekabet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type={authMode === 'login' ? 'text' : 'email'}
                  placeholder={authMode === 'login' ? 'E-posta veya ercanulger' : 'ornek@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Şifre</Label>
                  {authMode === 'login' && (
                    <Button type="button" variant="link" className="p-0 h-auto text-xs text-muted-foreground" onClick={handleResetPassword}>
                      Şifremi unuttum
                    </Button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full font-bold mt-6" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {authMode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        {authMode === 'login' && (
           <CardFooter className="flex justify-center text-xs text-muted-foreground text-center">
             Admin giriş: <span className="mx-1 font-semibold text-foreground">ercanulger / admin58</span> (ilk girişte otomatik oluşturulur).
           </CardFooter>
        )}
      </Card>
    </div>
  );
}
