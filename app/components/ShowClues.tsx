'use client';
import { useEffect } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { MessageCircle } from 'lucide-react';

export default function ShowClues() {
  const { room, currentPlayer } = useGameStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (room && currentPlayer?.id === room.leaderId) {
        updateDoc(doc(db, 'rooms', room.id), {
          state: 'vote'
        });
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [room, currentPlayer]);

  if (!room) return null;

  const playersWithClues = room.players.filter(p => p.clue && p.clue.length > 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              📝 Pistas de los Jugadores
            </h1>
            <p className="text-gray-300">Lee las pistas y decide quién es el impostor</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {playersWithClues.map((player) => (
              <div
                key={player.id}
                className="bg-white/20 rounded-xl p-6 hover:bg-white/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-blue-300 font-bold text-lg mb-1">{player.name}</div>
                    <p className="text-white text-lg">{player.clue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
              <p className="text-yellow-400 font-semibold">
                ⏱️ Preparándose para votar...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
