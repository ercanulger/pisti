import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks';
import { useLocation } from 'wouter';
import gsap from 'gsap';
import { 
  GameState, ScoreResult, createDeck, shuffleDeck, dealCards, playCard, 
  calculateScores, chooseBotCard, getRandomBotName, 
  getDeterministicColor, Player 
} from '@/lib/gameEngine';
import { firestoreHelpers } from '@/lib/firestore';
import { CardHand } from '@/components/game/CardHand';
import { TablePile } from '@/components/game/TablePile';
import { PlayingCard } from '@/components/game/PlayingCard';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function getGameStorageKey(uid: string) {
  return `pisti-game-state:${uid}`;
}

function loadPersistedGame(uid: string): GameState | null {
  try {
    const raw = localStorage.getItem(getGameStorageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.players?.length || parsed.status !== 'playing') return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function GamePage() {
  const { profile, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pistiMessage, setPistiMessage] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const pistiBannerRef = useRef<HTMLDivElement>(null);
  const tableAreaRef = useRef<HTMLDivElement>(null);

  // Initialize Game
  useEffect(() => {
    if (!profile) return;

    const persisted = loadPersistedGame(profile.uid);
    if (persisted) {
      persisted.players = persisted.players.map((player) =>
        player.id === profile.uid ? { ...player, name: profile.nickname } : player
      );
      setGameState(persisted);
      return;
    }

    const botName = getRandomBotName();
    const players: Player[] = [
      { id: profile.uid, name: profile.nickname, isBot: false, hand: [], captured: [], pistis: 0, score: 0 },
      { id: 'bot-1', name: botName, isBot: true, hand: [], captured: [], pistis: 0, score: 0, color: getDeterministicColor(botName) },
    ];

    const initialState = dealCards({
      deck: shuffleDeck(createDeck()),
      tablePile: [],
      players,
      currentPlayerIndex: 0,
      lastCapturerIndex: null,
      status: 'playing',
      round: 1
    });
    setGameState(initialState);
  }, [profile]);

  useEffect(() => {
    if (!profile || !gameState) return;
    if (gameState.status === 'finished') return;
    localStorage.setItem(getGameStorageKey(profile.uid), JSON.stringify(gameState));
  }, [gameState, profile]);

  // Bot Turn Logic
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing' || isAnimating) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.isBot) {
      const runBotTurn = async () => {
        setIsAnimating(true);
        // Simulate thinking time
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        
        const cardIndex = chooseBotCard(currentPlayer, gameState, 'medium');
        handlePlayCard(gameState.currentPlayerIndex, cardIndex);
      };
      runBotTurn();
    }
  }, [gameState, isAnimating]);

  const showPistiAnimation = () => {
    if (pistiBannerRef.current) {
      gsap.timeline()
        .set(pistiBannerRef.current, { scale: 0, opacity: 0, display: 'flex' })
        .to(pistiBannerRef.current, { scale: 1.5, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
        .to(pistiBannerRef.current, { scale: 1, duration: 0.2 })
        .to(pistiBannerRef.current, { opacity: 0, delay: 0.8, duration: 0.3 })
        .set(pistiBannerRef.current, { display: 'none' });
    }
  };

  const handlePlayCard = (playerIndex: number, cardIndex: number) => {
    if (!gameState) return;
    
    setIsAnimating(true);
    const { newState, isPisti, captured } = playCard(gameState, playerIndex, cardIndex);

    if (tableAreaRef.current) {
      gsap.fromTo(
        tableAreaRef.current,
        { scale: 0.94, rotate: playerIndex === 0 ? -2 : 2 },
        { scale: 1, rotate: 0, duration: captured.length > 0 ? 0.45 : 0.28, ease: captured.length > 0 ? 'back.out(2)' : 'power2.out' }
      );
    }
    
    setGameState(newState);
    
    if (isPisti) {
      setPistiMessage(`${newState.players[playerIndex].name} PİŞTİ YAPTI!`);
      showPistiAnimation();
    }
    
    setTimeout(() => {
      // Check if round is over (hands empty)
      if (newState.players.every(p => p.hand.length === 0)) {
        if (newState.deck.length > 0) {
          // Deal next round
          const nextState = dealCards(newState);
          nextState.round += 1;
          setGameState(nextState);
          setIsAnimating(false);
        } else {
          // Game Over
          handleGameOver(newState);
        }
      } else {
        setIsAnimating(false);
      }
    }, isPisti ? 1500 : 500); // Wait longer if pisti
  };

  const handleGameOver = async (finalState: GameState) => {
    const scores = calculateScores(finalState);
    finalState.status = 'finished';
    setGameState(finalState);
    setResult(scores);
    if (profile) {
      localStorage.removeItem(getGameStorageKey(profile.uid));
    }

    if (profile) {
      const myScoreInfo = scores.players.find(p => p.id === profile.uid);
      const isWinner = scores.winnerIndex !== null && scores.players[scores.winnerIndex].id === profile.uid;
      const isDraw = scores.winnerIndex === null;
      
      let resType: 'win' | 'loss' | 'draw' = 'loss';
      let coins = 10;
      let cups = 0;

      if (isWinner) {
        resType = 'win';
        coins = 50;
        cups = 3;
      } else if (isDraw) {
        resType = 'draw';
        coins = 20;
        cups = 1;
      }

      // Bonus coins for pistis
      if (myScoreInfo) {
        coins += myScoreInfo.pistis * 5;
      }

      try {
        await firestoreHelpers.saveGameResult({
          uid: profile.uid,
          result: resType,
          score: myScoreInfo?.score || 0,
          pistiCount: myScoreInfo?.pistis || 0,
          coinsEarned: coins,
          trophiesEarned: cups,
          playedAt: new Date()
        });
        await refreshProfile();
      } catch (err) {
        console.error("Failed to save game stats", err);
      }
    }
  };

  if (!gameState || !profile) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background">Yükleniyor...</div>;
  }

  const myPlayerIndex = gameState.players.findIndex(p => p.id === profile.uid);
  const me = gameState.players[myPlayerIndex];
  const bot = gameState.players[1 - myPlayerIndex]; // Assuming 1v1

  return (
    <div className={`min-h-[100dvh] flex flex-col relative overflow-hidden ${profile.activeTable || 'table-classic'}`}>
      
      {/* Top Bar - Game Info & Opponent */}
      <div className="flex justify-between items-center p-4 text-white z-10 bg-black/20 backdrop-blur-sm">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setLocation('/')}>
          Çıkış
        </Button>
        <div className="text-center">
          <div className="text-xs text-white/70">Deste</div>
          <div className="font-bold">{gameState.deck.length}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="font-bold text-sm">{bot.name}</div>
            <div className="text-xs text-white/70">Puan: {bot.score}</div>
          </div>
          <Avatar className="w-10 h-10 border-2 border-white/20" style={{ borderColor: bot.color }}>
            <AvatarFallback style={{ backgroundColor: bot.color, color: 'white' }}>
              {bot.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Opponent Hand */}
      <div className="flex justify-center mt-4">
        <div className="flex -space-x-4">
          {bot.hand.map((card, i) => (
            <PlayingCard key={`bot-${i}`} faceDown className="scale-75" />
          ))}
        </div>
      </div>

      {/* Center Table */}
      <div ref={tableAreaRef} className="flex-1 flex items-center justify-center relative">
        <TablePile cards={gameState.tablePile} />
        
        {/* Pisti Banner */}
        <div 
          ref={pistiBannerRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 hidden"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-black text-4xl sm:text-6xl px-8 py-4 rounded-xl border-4 border-yellow-200 shadow-[0_0_50px_rgba(250,204,21,0.8)] rotate-[-5deg]">
            {pistiMessage}
          </div>
        </div>
      </div>

      {/* My Player Hand */}
      <div className="mb-6 relative">
        <div className="absolute -top-12 left-4 text-white">
          <div className="font-bold text-sm">{me.name}</div>
          <div className="text-xs text-white/70">Puan: {me.score}</div>
        </div>
        
        <div className="absolute -top-12 right-4 flex space-x-2">
           {gameState.currentPlayerIndex === myPlayerIndex && !isAnimating && (
             <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full animate-pulse">Sıra Sende</span>
           )}
        </div>

        <div className="player-hand-wrap">
          <div className="player-hand-shadow" />
          <div className="player-thumb" />
          <div className="player-palm" />
          <CardHand 
            cards={me.hand} 
            className="relative z-20"
            onPlayCard={(idx) => handlePlayCard(myPlayerIndex, idx)}
            disabled={gameState.currentPlayerIndex !== myPlayerIndex || isAnimating || gameState.status === 'finished'}
          />
        </div>
      </div>

      {/* Result Overlay */}
      {gameState.status === 'finished' && result && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-card text-card-foreground p-6 rounded-2xl w-full max-w-sm border-2 border-primary/50 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-center mb-6 text-primary">
              {result.winnerIndex === null ? 'BERABERE' : result.winnerIndex === myPlayerIndex ? 'KAZANDIN!' : 'KAYBETTİN'}
            </h2>
            
            <div className="space-y-4">
              {result.players.map((p: ScoreResult['players'][number]) => (
                <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg ${p.id === profile.uid ? 'bg-primary/20 border border-primary/50' : 'bg-muted/50'}`}>
                  <span className="font-bold">{p.name}</span>
                  <div className="text-right">
                    <div className="text-lg font-bold">{p.score} Puan</div>
                    <div className="text-xs text-muted-foreground">{p.capturedCount} Kart, {p.pistis} Pişti</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center space-x-4 text-lg">
              {result.winnerIndex === myPlayerIndex && (
                <>
                  <span className="flex items-center text-yellow-500 font-bold"><Coins className="w-5 h-5 mr-1"/> +50</span>
                  <span className="flex items-center text-orange-500 font-bold"><Trophy className="w-5 h-5 mr-1"/> +3</span>
                </>
              )}
            </div>

            <div className="mt-8 flex space-x-3">
              <Button className="flex-1" variant="outline" onClick={() => setLocation('/')}>Ana Sayfa</Button>
              <Button className="flex-1" onClick={() => window.location.reload()}>Tekrar Oyna</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
