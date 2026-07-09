import React, { useState } from 'react';
import { useAuth } from '@/hooks';
import { firestoreHelpers } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, CheckCircle, Store as StoreIcon } from 'lucide-react';

const FRAMES = [
  { id: 'frame-flame', name: 'Altın Alev', price: 500 },
  { id: 'frame-diamond', name: 'Elmas Parıltı', price: 750 },
  { id: 'frame-neon', name: 'Neon Işık', price: 600 },
  { id: 'frame-royal', name: 'Kraliyet', price: 1000 },
  { id: 'frame-shadow', name: 'Gölge Efekti', price: 400 },
  { id: 'frame-galaxy', name: 'Galaksi', price: 900 },
  { id: 'frame-rainbow', name: 'Gökkuşağı', price: 700 },
  { id: 'frame-fire', name: 'Kırmızı Ateş', price: 550 },
  { id: 'frame-ice', name: 'Buz Kristali', price: 650 },
  { id: 'frame-golden', name: 'Saf Altın', price: 1200 },
];

const TABLES = [
  { id: 'table-classic', name: 'Klasik Yeşil', price: 0 },
  { id: 'table-midnight', name: 'Gece Mavisi', price: 500 },
  { id: 'table-crimson', name: 'Kırmızı Kadife', price: 600 },
  { id: 'table-ocean', name: 'Okyanus', price: 450 },
  { id: 'table-marble', name: 'Mermer', price: 800 },
];

export default function StorePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!profile) return null;

  const handlePurchase = async (type: 'frame' | 'table', itemId: string, price: number) => {
    if (profile.coins < price) {
      toast({ title: 'Hata', description: 'Yetersiz altın.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      const updates: any = { coins: profile.coins - price };
      if (type === 'frame') {
        updates.ownedFrames = [...(profile.ownedFrames || []), itemId];
        updates.activeFrame = itemId;
      } else {
        updates.ownedTables = [...(profile.ownedTables || []), itemId];
        updates.activeTable = itemId;
      }

      await firestoreHelpers.updateUserProfile(profile.uid, updates);
      await refreshProfile();
      toast({ title: 'Başarılı', description: 'Satın alma tamamlandı ve aktif edildi!' });
    } catch (error: any) {
      toast({ title: 'Hata', description: 'İşlem başarısız.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEquip = async (type: 'frame' | 'table', itemId: string) => {
    setIsProcessing(true);
    try {
      const updates = type === 'frame' ? { activeFrame: itemId } : { activeTable: itemId };
      await firestoreHelpers.updateUserProfile(profile.uid, updates);
      await refreshProfile();
      toast({ title: 'Başarılı', description: 'Kuşanıldı!' });
    } catch (error) {
      toast({ title: 'Hata', description: 'İşlem başarısız.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary flex items-center">
            <StoreIcon className="w-6 h-6 mr-2" /> Mağaza
          </h1>
          <p className="text-sm text-muted-foreground">Profilini ve masanı özelleştir</p>
        </div>
        <div className="flex items-center space-x-1 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20 font-bold text-lg">
          <Coins className="w-5 h-5" />
          <span>{profile.coins}</span>
        </div>
      </div>

      <Tabs defaultValue="frames">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
          <TabsTrigger value="frames">Çerçeveler</TabsTrigger>
          <TabsTrigger value="tables">Masalar</TabsTrigger>
        </TabsList>

        <TabsContent value="frames" className="space-y-4">
          {FRAMES.map((item) => {
            const isOwned = profile.ownedFrames?.includes(item.id);
            const isActive = profile.activeFrame === item.id;
            const canAfford = profile.coins >= item.price;

            return (
              <Card key={item.id} className="overflow-hidden border-border/50 bg-card/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center relative">
                       <div className={`absolute inset-0 rounded-full ${item.id}`} />
                       <div className="w-12 h-12 rounded-full bg-muted border-2 border-background z-10" />
                    </div>
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      {!isOwned && (
                        <div className="flex items-center text-yellow-500 text-sm font-semibold">
                          <Coins className="w-4 h-4 mr-1" /> {item.price}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    {isActive ? (
                      <Button variant="secondary" disabled className="w-24 text-green-500 bg-green-500/10 hover:bg-green-500/10">
                        <CheckCircle className="w-4 h-4 mr-1" /> Aktif
                      </Button>
                    ) : isOwned ? (
                      <Button variant="outline" className="w-24 border-primary text-primary" onClick={() => handleEquip('frame', item.id)} disabled={isProcessing}>
                        Kuşan
                      </Button>
                    ) : (
                      <Button 
                        className="w-24" 
                        disabled={!canAfford || isProcessing}
                        onClick={() => handlePurchase('frame', item.id, item.price)}
                      >
                        Satın Al
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          {TABLES.map((item) => {
            const isOwned = item.price === 0 || profile.ownedTables?.includes(item.id);
            const isActive = profile.activeTable === item.id;
            const canAfford = profile.coins >= item.price;

            return (
              <Card key={item.id} className="overflow-hidden border-border/50 bg-card/50">
                <CardContent className="p-0 flex flex-col">
                  <div className={`h-24 w-full ${item.id} flex items-center justify-center`}>
                    <span className="text-white/50 font-bold uppercase tracking-widest text-sm">Önizleme</span>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-card">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      {!isOwned && (
                        <div className="flex items-center text-yellow-500 text-sm font-semibold">
                          <Coins className="w-4 h-4 mr-1" /> {item.price}
                        </div>
                      )}
                    </div>
                    <div>
                      {isActive ? (
                        <Button variant="secondary" disabled className="w-24 text-green-500 bg-green-500/10 hover:bg-green-500/10">
                          <CheckCircle className="w-4 h-4 mr-1" /> Aktif
                        </Button>
                      ) : isOwned ? (
                        <Button variant="outline" className="w-24 border-primary text-primary" onClick={() => handleEquip('table', item.id)} disabled={isProcessing}>
                          Kuşan
                        </Button>
                      ) : (
                        <Button 
                          className="w-24" 
                          disabled={!canAfford || isProcessing}
                          onClick={() => handlePurchase('table', item.id, item.price)}
                        >
                          Satın Al
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
