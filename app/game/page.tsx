import { GameClient } from "@/components/game-client";

export default function GamePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Oyun Masası</h1>
      <GameClient />
    </div>
  );
}
