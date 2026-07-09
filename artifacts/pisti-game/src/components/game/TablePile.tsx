import React from 'react';
import { Card } from '@/lib/gameEngine';
import { PlayingCard } from './PlayingCard';

interface TablePileProps {
  cards: Card[];
}

export function TablePile({ cards }: TablePileProps) {
  if (cards.length === 0) {
    return (
      <div className="w-16 h-24 sm:w-20 sm:h-32 border-2 border-dashed border-white/20 rounded-md flex items-center justify-center">
        <span className="text-white/20 font-bold opacity-50">MASA</span>
      </div>
    );
  }

  // Optimize rendering for many cards - only show top few to prevent DOM bloat
  const visibleCards = cards.slice(-3); // show at most last 3 for thickness
  const isMultiple = cards.length > 1;

  return (
    <div className="relative w-16 h-24 sm:w-20 sm:h-32">
      {/* Background card representing the pile if > 1 */}
      {isMultiple && (
        <div className="absolute top-0 left-0 -ml-1 -mt-1 opacity-80" style={{ zIndex: 0, transform: 'rotate(-2deg)' }}>
          <PlayingCard faceDown={true} />
        </div>
      )}
      
      {/* The actual visible top cards slightly staggered */}
      {visibleCards.map((card, idx) => {
        const isTop = idx === visibleCards.length - 1;
        return (
          <div 
            key={card.id + idx} 
            className="absolute top-0 left-0"
            style={{ 
              zIndex: idx + 1,
              transform: isTop ? 'rotate(0deg)' : `rotate(${Math.random() * 4 - 2}deg)`,
              display: isTop ? 'block' : 'none' // only show top to keep it clean, maybe just rotate the top one randomly when placed
            }}
          >
            <PlayingCard card={card} />
          </div>
        );
      })}
      
      {/* Badge showing pile count */}
      {cards.length > 1 && (
        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10 shadow-lg border-2 border-card">
          {cards.length}
        </div>
      )}
    </div>
  );
}
