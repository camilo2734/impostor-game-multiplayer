'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

const WORDS = ['perro', 'gato', 'pizza', 'playa', 'música', 'libro', 'café', 'montaña', 'teléfono', 'computadora'];

export default function VotingResults() {
  const { room } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!room) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          processElimination();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room]);

  const processElimination = async () => {
    if (!room) return;

    // Contar votos
    const voteCounts: { [playerId: string]: number } = {};
    room.players.forEach((player) => {
      if (player.votedFor) {
        voteCounts[player.votedFor] = (voteCounts[player.votedFor] || 0) + 1;
      }
    });

    // Encontrar el más votado
    let maxVotes = 0;
    let eliminatedPlayerId = '';
    Object.entries(voteCounts).forEach(([playerId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        eliminatedPlayerId = playerId;
      }
    });

    const eliminatedPlayer = room.players.find(p => p.id === eliminatedPlayerId);
    
    if (eliminatedPlayer?.isImpostor) {
      // Si era el impostor, terminar el juego
      await updateDoc(doc(db, 'rooms', room.id), {
        state: 'finish'
      });
    } else {
      // Si no era impostor, continuar a siguiente ronda
      const remainingPlayers = room.players.filter(p => p.id !== eliminatedPlayerId);
      const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      
      // Resetear votos
      const resetPlayers = remainingPlayers.map(p => ({
        ...p,
        votedFor: '',
        clue: ''
      }));

      await updateDoc(doc(db, 'rooms', room.id), {
        players: resetPlayers,
        currentWord: newWord,
        state: 'round',
        roundStartTime: Date.now()
      });
    }
  };

  if (!room) return null;

  // Contar votos
  const voteCounts: { [playerId: string]: number } = {};
  room.players.forEach((player) => {
    if (player.votedFor) {
      voteCounts[player.votedFor] = (voteCounts[player.votedFor] || 0) + 1;
    }
  });

  // Encontrar el más votado
  let maxVotes = 0;
  let eliminatedPlayerId = '';
  Object.entries(voteCounts).forEach(([playerId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminatedPlayerId = playerId;
    }
  });

  const eliminatedPlayer = room.players.find(p => p.id === eliminatedPlayerId);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="max-w-3xl w-full space-y-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              📊 Resultados de Votación
            </h1>
            <div className="text-yellow-400 text-2xl font-bold">
              Procesando en {timeLeft}s...
            </div>
          </div>

          {/* Tabla: Quién votó por quién */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Votos Emitidos:</h2>
            <div className="space-y-2">
              {room.players.map((player) => {
                const votedPlayer = room.players.find(p => p.id === player.votedFor);
                return (
                  <div key={player.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white font-semibold">{player.name}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-white">{votedPlayer?.name || 'Sin voto'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla: Votos recibidos */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Votos Recibidos:</h2>
            <div className="space-y-2">
              {room.players.map((player) => {
                const votes = voteCounts[player.id] || 0;
                const isEliminated = player.id === eliminatedPlayerId;
                return (
                  <div 
                    key={player.id} 
                    className={`rounded-lg p-3 flex items-center justify-between ${
                      isEliminated ? 'bg-red-600/30 border-2 border-red-500' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-white font-semibold">{player.name}</span>
                    <span className="text-yellow-400 font-bold text-lg">
                      {votes} voto{votes !== 1 ? 's' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jugador eliminado */}
          {eliminatedPlayer && (
            <div className="bg-red-600/30 border-2 border-red-500 rounded-lg p-6 text-center animate-pulse">
              <h2 className="text-3xl font-bold text-white mb-4">Jugador Eliminado:</h2>
              <div className="text-5xl font-bold text-red-400 mb-4">{eliminatedPlayer.name}</div>
              <div className="text-2xl font-semibold">
                Rol: <span className={eliminatedPlayer.isImpostor ? "text-red-300" : "text-blue-300"}>
                  {eliminatedPlayer.isImpostor ? '🔴 Impostor' : '🔵 Civil'}
                </span>
              </div>
              <div className="mt-4 text-white text-lg">
                {eliminatedPlayer.isImpostor ? (
                  <div className="text-green-400 font-bold">¡Los civiles ganaron! 🎉</div>
                ) : (
                  <div className="text-orange-400">Continúa la siguiente ronda...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}