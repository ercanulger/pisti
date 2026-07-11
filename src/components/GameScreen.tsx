/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Player, Card, MatchHistory } from '../types';
import { generateDeck, calculateScore, makeBotMove, selectOpponents } from '../utils/engine';
import { saveMatchResult, updateAllQuestsProgress } from '../utils/db';
import { Wifi, WifiOff, RefreshCw, Trophy, Coins, Play, Award, Volume2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface GameScreenProps {
  currentUser: Player;
  gameMode: 'tekli' | 'esli' | 'ozel';
  onQuit: () => void;
  onMatchFinished: (historyItem: MatchHistory) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ currentUser, gameMode, onQuit, onMatchFinished }) => {
  // Opponents & Seeding
  const [opponents, setOpponents] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]); // User is index 0, Bots are index 1, 2, 3
  
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [hands, setHands] = useState<{ [playerId: string]: Card[] }>({});
  const [boardPile, setBoardPile] = useState<Card[]>([]);
  const [capturedCards, setCapturedCards] = useState<{ [playerId: string]: Card[] }>({});
  const [pistis, setPistis] = useState<{ [playerId: string]: number }>({});
  const [jackPistis, setJackPistis] = useState<{ [playerId: string]: number }>({});
  
  const [currentTurn, setCurrentTurn] = useState<number>(0); // 0: Player, 1: Bot Left, 2: Bot Top, 3: Bot Right
  const [lastCapturerId, setLastCapturerId] = useState<string | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [dealerIdx, setDealerIdx] = useState(3); // bot 3 deals first, user plays first

  // Special effects
  const [rippleActive, setRippleActive] = useState(false);
  const [pistiOverlay, setPistiOverlay] = useState<{ show: boolean; text: string; isJack: boolean }>({
    show: false,
    text: '',
    isJack: false,
  });
  const [hapticShake, setHapticShake] = useState(false);

  // Reconnection Manager (30s)
  const [isOffline, setIsOffline] = useState(false);
  const [reconnectCountdown, setReconnectCountdown] = useState<number>(30);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Card played tracking (for Expert Bot memory)
  const [playedHistory, setPlayedHistory] = useState<Card[]>([]);

  // Refs to maintain the most up-to-date states and bypass React's async closure problem
  const deckRef = useRef<Card[]>([]);
  const handsRef = useRef<{ [playerId: string]: Card[] }>({});

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    handsRef.current = hands;
  }, [hands]);

  // Initialize Game on Mount
  useEffect(() => {
    const bots = selectOpponents();
    setOpponents(bots);
    
    // Combine to list of all 4 players
    const fullPlayersList = [currentUser, ...bots];
    setAllPlayers(fullPlayersList);

    // Initialize round
    startNewGame(fullPlayersList);
  }, []);

  // Reconnection countdown handler
  useEffect(() => {
    if (isOffline) {
      // Trigger disconnect countdown
      setLogs((prev) => ['[SİNYAL KOPUKLUĞU] Ağ bağlantısı kesildi. Yeniden bağlanılıyor... (30s limit)', ...prev]);
      reconnectTimerRef.current = setInterval(() => {
        setReconnectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(reconnectTimerRef.current!);
            // User gets disqualified
            handleQuitGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (reconnectTimerRef.current) {
        clearInterval(reconnectTimerRef.current);
        setLogs((prev) => ['[SİNYAL ALINDI] Bağlantı sağlandı! Oyuna devam ediliyor.', ...prev]);
        setReconnectCountdown(30);
      }
    }

    return () => {
      if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
    };
  }, [isOffline]);

  // Haptic feedback trigger helper
  const triggerHaptic = () => {
    setHapticShake(true);
    setTimeout(() => setHapticShake(false), 200);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([25]); // vibrate 25ms on mobile browsers
    }
  };

  // Bot Turn Handler
  useEffect(() => {
    if (gameOver || isOffline || isDealing) return;

    // Check if player's turn or bot's turn
    if (currentTurn !== 0) {
      const activeBot = allPlayers[currentTurn];
      if (!activeBot) return;

      const botHand = handsRef.current[activeBot.id] || [];
      if (botHand.length === 0) {
        // If hand is empty, check if we need to deal next cards or end game
        checkRoundProgression(handsRef.current);
        return;
      }

      // Delay Bot moves slightly to make it visual
      const delay = 1500;
      const timer = setTimeout(() => {
        executeBotTurn(activeBot, currentTurn);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameOver, isOffline, isDealing]);

  const startNewGame = (playersList: Player[]) => {
    const shufDeck = generateDeck();
    
    // Board pile starts with 4 cards: first 3 face down, 4th face up
    const initialBoard = shufDeck.slice(0, 4);
    const remainingDeck = shufDeck.slice(4);

    // Deal 4 cards to each player
    const initialHands: { [playerId: string]: Card[] } = {};
    let tempDeck = remainingDeck;

    playersList.forEach((p) => {
      initialHands[p.id] = tempDeck.slice(0, 4);
      tempDeck = tempDeck.slice(4);
    });

    setDeck(tempDeck);
    deckRef.current = tempDeck;

    setHands(initialHands);
    handsRef.current = initialHands;

    setBoardPile(initialBoard);
    setCapturedCards(playersList.reduce((acc, p) => ({ ...acc, [p.id]: [] }), {}));
    setPistis(playersList.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
    setJackPistis(playersList.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {}));
    
    setCurrentTurn(0); // Human starts
    setLastCapturerId(null);
    setPlayedHistory([]);
    setGameOver(false);
    setLogs(['Oyun başladı! Masadaki kart: ' + getCardDisplay(initialBoard[3])]);
  };

  const executeBotTurn = (bot: Player, botIndex: number) => {
    const botHand = handsRef.current[bot.id] || [];
    const chosenCard = makeBotMove(botHand, boardPile, bot.botLevel || 'beginner', playedHistory);
    
    playCard(bot.id, chosenCard, botIndex);
  };

  const playCard = (playerId: string, card: Card, playerIndex: number) => {
    const cardWithPlayer = { ...card, playedBy: playerId };

    // 1. Remove card from player hand using atomic update
    const currentHands = { ...handsRef.current };
    const playerHand = currentHands[playerId] || [];
    const nextPlayerHand = playerHand.filter((c) => c.id !== card.id);
    const nextHands = {
      ...currentHands,
      [playerId]: nextPlayerHand,
    };

    setHands(nextHands);
    handsRef.current = nextHands;

    // Trigger haptic & ripple effects
    triggerHaptic();
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 800);

    // 2. Track history
    setPlayedHistory((prev) => [...prev, cardWithPlayer]);

    const activePlayer = allPlayers[playerIndex];
    const cardText = getCardDisplay(card);
    setLogs((prev) => [`${activePlayer.username} oynadı: ${cardText}`, ...prev]);

    // 3. Process card on pile
    const newPile = [...boardPile, cardWithPlayer];
    
    // Check match capture condition
    if (boardPile.length > 0) {
      const topCard = boardPile[boardPile.length - 1];
      
      const valueMatch = card.value === topCard.value;
      const isJack = card.value === 11;

      if (valueMatch || (isJack && boardPile.length > 0)) {
        // MATCH CAPTURE!
        setLastCapturerId(playerId);

        // Check if Pişti (Pisti) condition: pile has EXACTLY 1 card beforehand, and card matches the value!
        if (boardPile.length === 1 && valueMatch) {
          const isJackPisti = card.value === 11;
          
          if (isJackPisti) {
            setJackPistis((prev) => ({ ...prev, [playerId]: prev[playerId] + 1 }));
            setPistiOverlay({ show: true, text: 'VALE PİŞTİSİ!', isJack: true });
            
            if (playerId === currentUser.id) {
              updateAllQuestsProgress('vale_pisti', 1);
            }
          } else {
            setPistis((prev) => ({ ...prev, [playerId]: prev[playerId] + 1 }));
            setPistiOverlay({ show: true, text: 'PİŞTİ!', isJack: false });
            
            if (playerId === currentUser.id) {
              updateAllQuestsProgress('pisti', 1);
            }
          }

          setLogs((prev) => [`🔥 PİŞTİ! ${activePlayer.username} muazzam bir pişti patlattı! (+${isJackPisti ? '20' : '10'} Puan)`, ...prev]);
          
          // Clear overlay after 2.5s
          setTimeout(() => setPistiOverlay({ show: false, text: '', isJack: false }), 2500);
        } else {
          setLogs((prev) => [`✓ ${activePlayer.username} yerdeki kartları topladı.`, ...prev]);
        }

        // Add both pile cards and played card to player's captured cards
        setCapturedCards((prev) => ({
          ...prev,
          [playerId]: [...prev[playerId], ...newPile],
        }));

        setBoardPile([]); // Empty center board pile
      } else {
        // No capture, card stays on board
        setBoardPile(newPile);
      }
    } else {
      // Empty pile, card just sits there
      setBoardPile(newPile);
    }

    // 4. Move turn to next player
    const nextTurn = (playerIndex + 1) % 4;
    
    // Check if hands are all empty to deal next or finish
    const allHandsEmpty = Object.values(nextHands).every((h) => (h as Card[]).length === 0);

    if (allHandsEmpty) {
      setTimeout(() => checkRoundProgression(nextHands), 600);
    } else {
      setCurrentTurn(nextTurn);
    }
  };

  const checkRoundProgression = (currentHands = handsRef.current) => {
    // Check if hands are empty
    const allHandsEmpty = allPlayers.every((p) => (currentHands[p.id] || []).length === 0);
    
    if (allHandsEmpty) {
      const currentDeck = [...deckRef.current];
      if (currentDeck.length > 0) {
        // Deal next round of cards
        setIsDealing(true);
        setLogs((prev) => ['Yeni kartlar dağıtılıyor...', ...prev]);

        setTimeout(() => {
          let tempDeck = [...deckRef.current];
          const nextHands: { [playerId: string]: Card[] } = {};

          allPlayers.forEach((p) => {
            nextHands[p.id] = tempDeck.slice(0, 4);
            tempDeck = tempDeck.slice(4);
          });

          setDeck(tempDeck);
          deckRef.current = tempDeck;

          setHands(nextHands);
          handsRef.current = nextHands;

          setIsDealing(false);
          setCurrentTurn(0); // human plays first
          setLogs((prev) => ['Yeni el dağıtıldı! Senin sıran.', ...prev]);
        }, 1200);
      } else {
        // Deck exhausted, Round Ended!
        endRound();
      }
    }
  };

  const endRound = () => {
    setGameOver(true);

    // Gather remaining board pile to the last capturer
    let remainingPile = [...boardPile];
    let finalCaptures = { ...capturedCards };

    if (remainingPile.length > 0 && lastCapturerId) {
      finalCaptures[lastCapturerId] = [...finalCaptures[lastCapturerId], ...remainingPile];
      const lastPlayer = allPlayers.find((p) => p.id === lastCapturerId);
      setLogs((prev) => [`Kalan ${remainingPile.length} kart son toplayan ${lastPlayer?.username || 'oyuncu'} hanesine yazıldı.`, ...prev]);
      setBoardPile([]);
    }

    // Find who has most cards to award 3 points
    let maxCardCount = 0;
    let mostCardsWinnerId: string | null = null;
    let isTie = false;

    allPlayers.forEach((p) => {
      const count = finalCaptures[p.id].length;
      if (count > maxCardCount) {
        maxCardCount = count;
        mostCardsWinnerId = p.id;
        isTie = false;
      } else if (count === maxCardCount) {
        isTie = true;
      }
    });

    // Calculate final scores
    const playerScores: { [playerId: string]: any } = {};
    let winnerId = '';
    let highestScore = -1;

    allPlayers.forEach((p) => {
      const captured = finalCaptures[p.id] || [];
      const pCount = pistis[p.id] || 0;
      const jPCount = jackPistis[p.id] || 0;
      const hasMostCards = !isTie && p.id === mostCardsWinnerId;

      const scoreDetail = calculateScore(captured, pCount, jPCount, hasMostCards);
      playerScores[p.id] = scoreDetail;

      if (scoreDetail.totalScore > highestScore) {
        highestScore = scoreDetail.totalScore;
        winnerId = p.id;
      }
    });

    // Save history & award cups/coins
    const isPlayerWinner = winnerId === currentUser.id;
    const playerStat = playerScores[currentUser.id];

    // Coins: Winner gets 100 + score points, others get score points as coins
    const coinsEarned = isPlayerWinner ? 100 + playerStat.totalScore : playerStat.totalScore;
    
    // Elo Change: Winner gets +24, others get proportional changes based on scores
    const userEloChange = isPlayerWinner ? 24 : Math.max(-12, playerStat.totalScore - 20);

    const matchHistoryItem: MatchHistory = {
      id: `match_${Date.now()}`,
      date: new Date().toISOString(),
      players: allPlayers.map((p) => {
        const pStat = playerScores[p.id];
        const isBotWinner = p.id === winnerId;
        return {
          username: p.username,
          score: pStat.totalScore,
          eloChange: p.id === winnerId ? 24 : Math.max(-12, pStat.totalScore - 20),
          isPlayer: p.id === currentUser.id,
        };
      }).sort((a, b) => b.score - a.score),
      winnerId: winnerId === currentUser.id ? currentUser.id : allPlayers.find(p => p.id === winnerId)?.username || 'bot',
      pointsCollected: playerStat.totalScore,
      coinsEarned,
      eloEarned: userEloChange,
    };

    // Update Quests progression
    updateAllQuestsProgress('match', 1);
    updateAllQuestsProgress('elo', userEloChange > 0 ? userEloChange : 0);

    saveMatchResult(matchHistoryItem);

    // Callback to let parent view modal and update coins
    setTimeout(() => {
      onMatchFinished(matchHistoryItem);
    }, 1500);
  };

  const handleQuitGame = () => {
    if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
    onQuit();
  };

  const getCardDisplay = (card: Card): string => {
    let valueStr = card.value.toString();
    if (card.value === 1) valueStr = 'As';
    else if (card.value === 11) valueStr = 'Vale';
    else if (card.value === 12) valueStr = 'Kız';
    else if (card.value === 13) valueStr = 'Papaz';

    let suitStr = '';
    if (card.suit === 'spades') suitStr = 'Maça';
    else if (card.suit === 'hearts') suitStr = 'Kupa';
    else if (card.suit === 'diamonds') suitStr = 'Karo';
    else if (card.suit === 'clubs') suitStr = 'Sinek';

    return `${suitStr} ${valueStr}`;
  };

  // Suit symbols map
  const suitSymbols: { [key: string]: string } = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  const renderCardFront = (card: Card) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const symbol = suitSymbols[card.suit];
    
    let displayValue = card.value.toString();
    if (card.value === 1) displayValue = 'A';
    else if (card.value === 11) displayValue = 'J';
    else if (card.value === 12) displayValue = 'Q';
    else if (card.value === 13) displayValue = 'K';

    const colorClasses = isRed 
      ? 'text-rose-500 border-rose-950/40 bg-gradient-to-b from-rose-950/20 to-slate-950/95' 
      : 'text-cyan-400 border-cyan-950/40 bg-gradient-to-b from-cyan-950/10 to-slate-950/95';

    return (
      <div className={`w-full h-full bg-slate-950 border-2 border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between relative text-slate-100 select-none shadow-xl overflow-hidden transition-all duration-300 hover:border-slate-700`}>
        {/* Sleek abstract ambient card light meshes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950/90 to-slate-950 pointer-events-none" />
        <div className="absolute -inset-px bg-gradient-to-tr from-transparent via-slate-800/30 to-slate-700/20 rounded-xl pointer-events-none" />

        {/* Top-left card value and mini-suit */}
        <div className={`text-sm font-display font-extrabold leading-none ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
          {displayValue}
          <span className="block text-[11px] mt-0.5 opacity-90">{symbol}</span>
        </div>

        {/* Central visual core of the card */}
        <div className="flex flex-col items-center justify-center self-center relative w-12 h-12">
          {/* Subtle geometric circle frame */}
          <div className={`absolute inset-0 rounded-full border border-dashed opacity-10 animate-spin-slow ${isRed ? 'border-rose-500' : 'border-cyan-400'}`} style={{ animationDuration: '20s' }} />
          <div className={`text-4xl text-center relative z-10 select-none ${isRed ? 'text-rose-500 text-glow-magenta' : 'text-cyan-400 text-glow-cyan'}`}>
            {symbol}
          </div>
        </div>

        {/* Bottom-right card value and mini-suit */}
        <div className={`text-sm font-display font-extrabold leading-none self-end text-right ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
          {displayValue}
          <span className="block text-[11px] mt-0.5 opacity-90">{symbol}</span>
        </div>
      </div>
    );
  };

  const renderCardBack = () => {
    return (
      <div className="w-full h-full rounded-xl bg-holo-card border-2 border-indigo-500/40 p-2 flex flex-col items-center justify-center relative shadow-xl overflow-hidden group">
        {/* Tech grid backing visual details */}
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
        
        {/* Hologram metallic layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10 pointer-events-none" />
        
        {/* Gold neon border lines detail */}
        <div className="absolute inset-1.5 border border-indigo-400/20 rounded-lg pointer-events-none" />

        {/* Outer neon nodes detail */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-cyan-400/45" />
        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-cyan-400/45" />
        <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-cyan-400/45" />
        <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-cyan-400/45" />

        {/* Central geometric design core */}
        <div className="relative z-10 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800/80 rounded-xl px-2.5 py-3 shadow-inner">
          <span className="text-[11px] font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-wider">pisti</span>
          <span className="text-[7px] font-mono text-pink-500/80 block -mt-1 tracking-widest font-extrabold">.game</span>
          
          <div className="w-3 h-[1px] bg-indigo-500/30 my-1" />
          <span className="text-[8px] font-mono text-cyan-400/60 font-bold tracking-widest">CYBER</span>
        </div>
        
        {/* Back decoration details */}
        <div className="absolute opacity-10 text-cyan-400 text-3xl font-light scale-150 animate-pulse pointer-events-none">❖</div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col gap-6 relative ${hapticShake ? 'haptic-active' : ''}`}>
      
      {/* 1. Header with Reconnect button simulator */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border cursor-pointer select-none transition-all ${
              isOffline
                ? 'bg-red-950/40 border-red-800 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                : 'bg-emerald-950/40 border-emerald-950 text-emerald-400'
            }`}
          >
            {isOffline ? <WifiOff size={12} className="animate-pulse" /> : <Wifi size={12} />}
            <span>{isOffline ? 'OFFLINE' : 'ONLINE'}</span>
          </button>
          
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            MOD: {gameMode === 'tekli' ? 'TEKLİ LİG' : gameMode === 'esli' ? 'EŞLİ TAKIM' : 'ÖZEL MASA'}
          </span>
        </div>

        {/* Turn/Action Banner */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-slate-300">
            Sıra:{' '}
            <strong className="text-cyan-400 font-extrabold font-mono">
              {currentTurn === 0 ? 'Sende!' : allPlayers[currentTurn]?.username || 'Robot'}
            </strong>
          </span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>

        {/* Quit */}
        <button
          onClick={handleQuitGame}
          className="bg-slate-950 hover:bg-red-950/20 hover:border-red-900/40 border border-slate-800 text-slate-400 hover:text-red-400 px-3 py-1 rounded-xl text-xs font-mono transition-colors cursor-pointer"
        >
          Masadan Ayrıl
        </button>
      </div>

      {/* 2. Disconnect Reconnect Overlay */}
      {isOffline && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
          <WifiOff className="w-16 h-16 text-rose-500 animate-pulse mb-4" />
          <h3 className="text-xl font-display font-extrabold text-slate-100 tracking-tight">Bağlantı Kesildi!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            İnternet bağlantısı koptu. Oyundan elenmemeniz için 30 saniyelik yeniden bağlanma süreci devrededir.
          </p>
          
          <div className="text-4xl font-mono font-black text-rose-400 my-6 tracking-wide">
            {reconnectCountdown}s
          </div>

          <button
            onClick={() => setIsOffline(false)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          >
            Yeniden Bağlan
          </button>
        </div>
      )}

      {/* 3. Pişti Celebrator Overlay */}
      {pistiOverlay.show && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/30 pointer-events-none">
          <div className={`p-8 rounded-3xl border text-center animate-scale-in flex flex-col items-center justify-center gap-1 ${
            pistiOverlay.isJack
              ? 'bg-gradient-to-br from-indigo-950 to-indigo-900/90 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.6)]'
              : 'bg-gradient-to-br from-rose-950 to-rose-900/90 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)]'
          }`}>
            <span className="text-4xl md:text-6xl font-display font-black tracking-widest text-slate-100 uppercase animate-bounce text-glow-magenta">
              {pistiOverlay.text}
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 tracking-widest mt-2">
              +{pistiOverlay.isJack ? '20 Puan (Lüks)' : '10 Puan'}
            </span>
          </div>
        </div>
      )}

      {/* 4. GAME PLAYING FIELD (The Table) */}
      <div className="bg-gradient-to-b from-slate-900/40 via-indigo-950/20 to-slate-950/95 border border-slate-800/60 rounded-3xl p-6 md:p-8 min-h-[500px] flex flex-col justify-between relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* Table Neon light grids background */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

        {/* A. Top Opponent (Bot 2) */}
        <div className="flex justify-center">
          {opponents[1] && (
            <div className={`flex flex-col items-center gap-1.5 bg-slate-950/90 border px-4 py-2.5 rounded-2xl text-center shadow-lg transition-all duration-300 ${
              currentTurn === 2 
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                : 'border-slate-800/80'
            }`}>
              <div className="flex items-center gap-1.5">
                <img
                  src={opponents[1].avatarUrl}
                  alt={opponents[1].username}
                  className={`w-7 h-7 rounded-full bg-slate-900 border p-0.5 transition-all ${
                    currentTurn === 2 ? 'border-indigo-400' : 'border-slate-800'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className={`text-[11px] font-display font-bold transition-colors ${
                  currentTurn === 2 ? 'text-indigo-400 font-extrabold' : 'text-slate-300'
                }`}>
                  {opponents[1].username}
                </span>
                {currentTurn === 2 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </div>
              <div className="flex gap-1">
                {(hands[opponents[1].id] || []).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-5 h-7 bg-indigo-950/90 border border-indigo-900/60 rounded shadow-sm"
                    initial={{ y: -50, scale: 0.3, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 110,
                      damping: 14,
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* B. Middle Row (Bot Left, Pile Center, Bot Right) */}
        <div className="flex items-center justify-between gap-6 my-6">
          {/* Bot Left (Bot 1) */}
          <div className="w-24">
            {opponents[0] && (
              <div className={`flex flex-col items-center gap-1.5 bg-slate-950/90 border px-3 py-2.5 rounded-2xl text-center shadow-lg transition-all duration-300 ${
                currentTurn === 1 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'border-slate-800/80'
              }`}>
                <img
                  src={opponents[0].avatarUrl}
                  alt={opponents[0].username}
                  className={`w-7 h-7 rounded-full bg-slate-900 border p-0.5 transition-all ${
                    currentTurn === 1 ? 'border-indigo-400' : 'border-slate-800'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className={`text-[10px] font-display font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full transition-colors ${
                  currentTurn === 1 ? 'text-indigo-400 font-extrabold' : 'text-slate-300'
                }`}>
                  {opponents[0].username}
                </span>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {(hands[opponents[0].id] || []).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-4 h-6 bg-indigo-950/90 border border-indigo-900/60 rounded shrink-0 shadow-sm"
                      initial={{ x: -50, scale: 0.3, opacity: 0 }}
                      animate={{ x: 0, scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 110,
                        damping: 14,
                        delay: i * 0.12,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Arena Pile (Orta Yer) */}
          <div className={`flex-1 max-w-sm h-48 rounded-3xl flex items-center justify-center relative shadow-2xl transition-all duration-300 ${
            currentTurn === 0 
              ? 'bg-cyan-950/10 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.06)]' 
              : 'bg-slate-950/70 border border-slate-800/60'
          }`}>
            {/* Soft inner gaming circles to frame center play */}
            <div className="absolute inset-5 rounded-full border border-dashed border-slate-800/40 pointer-events-none flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-slate-900/40 bg-slate-950/30" />
            </div>

            {/* Visual Deste (Deck) stack in center arena */}
            {deck.length > 0 && (
              <div className="absolute top-3 right-4 flex flex-col items-center z-10">
                <div className="relative w-7 h-10">
                  {[...Array(Math.min(3, Math.ceil(deck.length / 4)))].map((_, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 bg-indigo-950/90 border border-indigo-800/50 rounded shadow-md"
                      style={{
                        transform: `translate(${i * 1.5}px, ${i * -1.5}px)`,
                        zIndex: 5 - i,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[8px] font-mono text-indigo-400 font-bold mt-1">{deck.length}</span>
              </div>
            )}

            {/* Ripple Wave Light effect */}
            {rippleActive && (
              <div className="absolute w-24 h-24 bg-cyan-400/20 border-2 border-cyan-400 rounded-full animate-ping pointer-events-none" />
            )}

            {boardPile.length === 0 ? (
              <div className="text-center p-4 relative z-10">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">BOŞ ARENA</span>
                <span className="text-[9px] font-sans text-slate-600 mt-1 block">Yere bir kart atarak oyunu başlat!</span>
              </div>
            ) : (
              <div className="relative w-24 h-36">
                {boardPile.map((card, idx) => {
                  const isTop = idx === boardPile.length - 1;
                  const rotation = (idx % 3) * 3 - 3; // slight scatter
                  
                  // Thrower-based source coordinates for flight slide transition
                  let initialX = 0;
                  let initialY = 0;
                  let initialRotate = 0;

                  if (card.playedBy === currentUser.id) {
                    initialX = 0;
                    initialY = 250;
                    initialRotate = 360; // spins
                  } else if (opponents[0] && card.playedBy === opponents[0].id) {
                    initialX = -250;
                    initialY = 0;
                    initialRotate = -360;
                  } else if (opponents[1] && card.playedBy === opponents[1].id) {
                    initialX = 0;
                    initialY = -250;
                    initialRotate = 180;
                  } else if (opponents[2] && card.playedBy === opponents[2].id) {
                    initialX = 250;
                    initialY = 0;
                    initialRotate = -180;
                  } else {
                    // Start cards dealt from deck
                    initialX = 150;
                    initialY = -150;
                    initialRotate = -90;
                  }

                  return (
                    <motion.div
                      key={card.id}
                      className="absolute inset-0"
                      initial={{
                        x: initialX,
                        y: initialY,
                        rotate: initialRotate,
                        scale: 0.5,
                        opacity: 0
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        rotate: rotation,
                        scale: 1,
                        opacity: 1
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 70, // gentle, elegant sliding
                        damping: 14,
                        duration: 0.8 // slow down
                      }}
                      style={{
                        zIndex: idx,
                      }}
                    >
                      {isTop ? renderCardFront(card) : renderCardBack()}
                    </motion.div>
                  );
                })}

                {/* Pile count tracker tag */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold text-cyan-400 z-30 whitespace-nowrap shadow-md">
                  {boardPile.length} KART
                </div>
              </div>
            )}
          </div>

          {/* Bot Right (Bot 3) */}
          <div className="w-24">
            {opponents[2] && (
              <div className={`flex flex-col items-center gap-1.5 bg-slate-950/90 border px-3 py-2.5 rounded-2xl text-center shadow-lg transition-all duration-300 ${
                currentTurn === 3 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                  : 'border-slate-800/80'
              }`}>
                <img
                  src={opponents[2].avatarUrl}
                  alt={opponents[2].username}
                  className={`w-7 h-7 rounded-full bg-slate-900 border p-0.5 transition-all ${
                    currentTurn === 3 ? 'border-indigo-400' : 'border-slate-800'
                  }`}
                  referrerPolicy="no-referrer"
                />
                <span className={`text-[10px] font-display font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full transition-colors ${
                  currentTurn === 3 ? 'text-indigo-400 font-extrabold' : 'text-slate-300'
                }`}>
                  {opponents[2].username}
                </span>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {(hands[opponents[2].id] || []).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-4 h-6 bg-indigo-950/90 border border-indigo-900/60 rounded shrink-0 shadow-sm"
                      initial={{ x: 50, scale: 0.3, opacity: 0 }}
                      animate={{ x: 0, scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 110,
                        damping: 14,
                        delay: i * 0.12,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* C. Bottom: Active Human Hand Curved Fan View */}
        <div className="flex flex-col items-center gap-4">
          
          {/* Card Count logs */}
          <div className={`flex items-center gap-4 justify-center text-[10px] font-mono uppercase tracking-widest border px-4 py-1.5 rounded-full transition-all duration-300 ${
            currentTurn === 0 
              ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/25 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
              : 'border-slate-850 bg-slate-950/40 text-slate-500'
          }`}>
            <span>Senin Topladığın: <strong className={currentTurn === 0 ? 'text-cyan-300' : 'text-slate-400'}>{capturedCards[currentUser.id]?.length || 0} Kart</strong></span>
            <div className={`w-1 h-1 rounded-full ${currentTurn === 0 ? 'bg-cyan-400' : 'bg-slate-700'}`} />
            <span>Kalan Deste: <strong className={currentTurn === 0 ? 'text-cyan-300' : 'text-slate-400'}>{deck.length} Kart</strong></span>
          </div>

          {/* The curved hand dock container */}
          <div className="fan-card-container flex justify-center items-end min-h-[160px] pb-2 relative w-full max-w-md">
            
            {(hands[currentUser.id] || []).length === 0 ? (
              <div className="text-xs text-slate-500 font-mono italic animate-pulse pb-6">Kartlar dağıtılıyor...</div>
            ) : (
              (hands[currentUser.id] || []).map((card, idx, arr) => {
                // Calculate curved fan arcs dynamically
                const len = arr.length;
                const centerIdx = (len - 1) / 2;
                const offsetFromCenter = idx - centerIdx;
                
                // Rotation and position variables
                const rotateDeg = offsetFromCenter * 10; // angle
                const translateY = Math.abs(offsetFromCenter) * 4; // curved drop down
                const translateX = offsetFromCenter * 20; // overlapping spread

                return (
                  <motion.div
                    key={card.id}
                    onClick={() => currentTurn === 0 && playCard(currentUser.id, card, 0)}
                    className={`w-24 h-36 relative cursor-pointer select-none origin-bottom flex-shrink-0 transition-all ${
                      currentTurn === 0 
                        ? 'shadow-indigo-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]' 
                        : 'opacity-50 pointer-events-none grayscale'
                    }`}
                    initial={{
                      x: 0,
                      y: -250, // Fly from the deck area at the top
                      rotate: 180, // spin on the fly
                      scale: 0.3,
                      opacity: 0,
                    }}
                    animate={{
                      x: translateX,
                      y: translateY,
                      rotate: rotateDeg,
                      scale: 1,
                      opacity: 1,
                    }}
                    whileHover={currentTurn === 0 ? {
                      scale: 1.15,
                      y: translateY - 20,
                      transition: { duration: 0.2 }
                    } : {}}
                    transition={{
                      type: 'spring',
                      stiffness: 90,
                      damping: 15,
                      delay: idx * 0.15, // Sequential elegant dealer effect
                    }}
                    style={{
                      zIndex: idx + 10,
                      marginRight: '-15px',
                    }}
                  >
                    {renderCardFront(card)}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 5. Logs console area */}
      <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl flex flex-col gap-2.5">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-extrabold">MASA GEÇMİŞİ / LOGS</span>
        <div className="h-20 overflow-y-auto divide-y divide-slate-900/60 font-mono text-xs text-slate-400">
          {logs.map((log, index) => (
            <div key={index} className="py-1 text-slate-400 flex items-center gap-1.5 last:text-slate-200">
              <span className="text-slate-600 text-[10px]">{index === 0 ? '●' : '◦'}</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
