import React from 'react';
import { Card } from '@/lib/gameEngine';
import { PlayingCard } from './PlayingCard';
import { cn } from '@/lib/utils';

interface CardHandProps {
  cards: Card[];
  onPlayCard: (index: number) => void;
  disabled: boolean;
  className?: string;
}

export function CardHand({ cards, onPlayCard, disabled, className }: CardHandProps) {
  const total = cards.length;
  
  return (
    <div className={cn("flex justify-center items-end h-36 sm:h-44 relative [perspective:1200px]", className)}>
      <div className="flex relative">
        {cards.map((card, idx) => {
          // Calculate fan spread
          const spreadAngle = Math.min(24, total * 4.5);
          const angleStep = total > 1 ? (spreadAngle * 2) / (total - 1) : 0;
          const angle = -spreadAngle + angleStep * idx;
          const centerOffset = idx - (total - 1) / 2;
          const yOffset = Math.pow(centerOffset, 2) * 2.4;
          const xOffset = centerOffset * 2;
          
          return (
            <div
              key={card.id}
              className="relative transition-all duration-300 origin-bottom"
              style={{
                transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${angle}deg) rotateX(5deg)`,
                zIndex: total - idx,
                marginLeft: idx > 0 ? '-28px' : '0',
              }}
            >
              <PlayingCard 
                card={card} 
                onClick={() => onPlayCard(idx)}
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
