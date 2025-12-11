'use client';

import { useGameStore } from '@/app/store/gameStore';
import { Trophy, Medal } from 'lucide-react';

export default function FinalResults() {
  const { room } = useGameStore();

  if (!room) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8">
      <Trophy className="w-32 h-32 mb-8 text-yellow-400" />
      <h1 className="text-5xl font-bold mb-12">¡Juego Terminado!</h1>
      
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Estadísticas Finales</h2>
        
        <div className="space-y-4">
          {room.players.map((player, index) => (
            <div key={player.id} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {index < 3 && <Medal className="w-6 h-6 text-yellow-400" />}
                <span className="text-xl font-semibold">{player.name}</span>
                {player.isImpostor && (
                  <span className="bg-red-500 text-xs px-2 py-1 rounded">IMPOSTOR</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

