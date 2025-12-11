'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Clock, Eye, EyeOff } from 'lucide-react';

export default function GameRound() {
  const { room, currentPlayer } = useGameStore();
  const [clue, setClue] = useState('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [showWord, setShowWord] = useState(true);

  useEffect(() => {
    if (!room?.roundStartTime) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - room.roundStartTime!) / 1000);
      const remaining = room.settings.clueTime - elapsed;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        submitClue();
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.roundStartTime]);

  const submitClue = async () => {
    if (!room || !currentPlayer) return;

    const updatedPlayers = room.players.map(p => 
      p.id === currentPlayer.id 
        ? { ...p, clue: clue.trim() || '(Sin pista)' }
        : p
    );

    await updateDoc(doc(db, 'rooms', room.id), {
      players: updatedPlayers
    });

    const allSubmitted = updatedPlayers.every(p => p.clue && p.clue.length > 0);
    
    if (allSubmitted) {
      await updateDoc(doc(db, 'rooms', room.id), {
        state: 'clues'
      });
    }
  };

  if (!room || !currentPlayer) return null;

  const player = room.players.find(p => p.id === currentPlayer.id);
  const hasSubmitted = player?.clue && player.clue.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Ronda {room.currentRound} de {room.settings.roundCount}
            </h1>
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-2xl font-bold">
              <Clock size={28} />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <div className="bg-white/20 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Tu Palabra:</h2>
              <button
                onClick={() => setShowWord(!showWord)}
                className="text-white hover:text-gray-300"
              >
                {showWord ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-center">
              {showWord ? (
                <div className="text-4xl font-bold text-white">
                  {player?.isImpostor ? '🎭 ERES EL IMPOSTOR' : room.currentWord}
                </div>
              ) : (
                <div className="text-2xl text-gray-300">***</div>
              )}
            </div>

            {player?.isImpostor && (
              <p className="text-yellow-300 text-sm mt-3 text-center">
                💡 Los demás tienen una palabra. ¡Adivina cuál es y pasa desapercibido!
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">
                Escribe tu pista:
              </label>
              <textarea
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                disabled={hasSubmitted!!hasSubmitted}
                placeholder="Escribe una pista sobre tu palabra..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={4}
                maxLength={100}
              />
              <div className="text-right text-gray-400 text-sm mt-1">
                {clue.length}/100
              </div>
            </div>

            {!hasSubmitted ? (
              <button
                onClick={submitClue}
                disabled={!clue.trim() || timeLeft === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                ✅ Enviar Pista
              </button>
            ) : (
              <div className="bg-green-600/20 border border-green-600 rounded-lg p-4 text-center">
                <p className="text-green-400 font-semibold">✓ Pista enviada</p>
                <p className="text-gray-300 text-sm mt-1">Esperando a los demás jugadores...</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <div className="text-gray-300 text-sm">
              Jugadores que enviaron: {room.players.filter(p => p.clue).length}/{room.players.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
