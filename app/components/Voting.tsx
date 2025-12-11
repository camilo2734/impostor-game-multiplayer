'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { UserX, Clock } from 'lucide-react';

export default function Voting() {
  const { room, currentPlayer } = useGameStore();
  const [selectedPlayer, setSelectedPlayer] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);

  if (!room || !currentPlayer) return null;

  const player = room.players.find(p => p.id === currentPlayer.id);
  const hasVoted = player?.votedFor && player.votedFor.length > 0;

    useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVote = async () => {
    if (!selectedPlayer) return;

    const updatedPlayers = room.players.map(p => 
      p.id === currentPlayer.id 
        ? { ...p, votedFor: selectedPlayer }
        : p
    );

    await updateDoc(doc(db, 'rooms', room.id), {
      players: updatedPlayers
    });

    const allVoted = updatedPlayers.every(p => p.votedFor && p.votedFor.length > 0);
    
    if (allVoted) {
      await updateDoc(doc(db, 'rooms', room.id), {
        state: 'results'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🗳️ Votación
            </h1>
            <p className="text-gray-300">¿Quién crees que es el impostor?</p>
                        <div className="flex items-center justify-center gap-2 text-yellow-400 text-2xl font-bold mt-4">
              <Clock size={28} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {!hasVoted ? (
            <div className="space-y-4">
              {room.players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayer(p.id)}
                  disabled={p.id === currentPlayer.id}
                  className={`w-full p-4 rounded-lg transition-all ${
                    p.id === currentPlayer.id
                      ? 'bg-gray-600 cursor-not-allowed opacity-50'
                      : selectedPlayer === p.id
                      ? 'bg-red-600 ring-4 ring-red-400'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserX size={24} className="text-white" />
                      <span className="text-white font-semibold text-lg">{p.name}</span>
                    </div>
                    {selectedPlayer === p.id && (
                      <span className="text-white">✓</span>
                    )}
                  </div>
                </button>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedPlayer}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition-all mt-6"
              >
                🗳️ Confirmar Voto
              </button>
            </div>
          ) : (
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-6 text-center">
              <p className="text-green-400 font-semibold text-xl">✓ Voto registrado</p>
              <p className="text-gray-300 mt-2">Esperando a los demás jugadores...</p>
              <div className="text-gray-400 text-sm mt-4">
                Votos registrados: {room.players.filter(p => p.votedFor).length}/{room.players.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
