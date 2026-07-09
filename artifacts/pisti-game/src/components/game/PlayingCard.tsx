import React from 'react';
import { Card as CardType } from '@/lib/gameEngine';
import { cn } from '@/lib/utils';
import { Heart, Diamond, Spade, Club } from 'lucide-react';

interface PlayingCardProps {
  card?: CardType;
  faceDown?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}

export const PlayingCard = React.forwardRef<HTMLDivElement, PlayingCardProps>(({ card, faceDown, className, style, onClick, disabled }, ref) => {
  if (faceDown || !card) {
    return (
      <div 
        ref={ref}
        className={cn(
          "w-16 h-24 sm:w-20 sm:h-32 rounded-md border-2 border-white/10 shadow-lg cursor-default relative overflow-hidden",
          "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGwyMCAyME0yMCAwbC0yMCAyMCIgc3Ryb2tlPSIjZmZmZmZmMjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] bg-blue-900 bg-repeat",
          className
        )}
        style={style}
      >
        <div className="absolute inset-2 border border-white/20 rounded-sm pointer-events-none" />
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  
  const SuitIcon = () => {
    switch (card.suit) {
      case 'hearts': return <Heart className="fill-current w-full h-full" />;
      case 'diamonds': return <Diamond className="fill-current w-full h-full" />;
      case 'spades': return <Spade className="fill-current w-full h-full" />;
      case 'clubs': return <Club className="fill-current w-full h-full" />;
    }
  };

  return (
    <div
      ref={ref}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "w-16 h-24 sm:w-20 sm:h-32 rounded-md bg-white border border-gray-300 shadow-md relative flex flex-col justify-between p-1 transition-transform select-none",
        isRed ? "text-red-600" : "text-black",
        disabled ? "opacity-90 cursor-not-allowed" : "cursor-pointer hover:-translate-y-2 hover:shadow-xl",
        className
      )}
      style={style}
    >
      {/* Top Left */}
      <div className="flex flex-col items-center justify-start h-8 w-4 leading-none">
        <span className="text-[12px] sm:text-[14px] font-bold tracking-tighter">{card.rank}</span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3"><SuitIcon /></div>
      </div>
      
      {/* Center Big Icon for faces/aces or pattern */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-10 h-10 sm:w-12 sm:h-12"><SuitIcon /></div>
      </div>
      
      {/* Bottom Right */}
      <div className="flex flex-col items-center justify-start h-8 w-4 leading-none absolute bottom-1 right-1 rotate-180">
        <span className="text-[12px] sm:text-[14px] font-bold tracking-tighter">{card.rank}</span>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3"><SuitIcon /></div>
      </div>
    </div>
  );
});

PlayingCard.displayName = 'PlayingCard';
