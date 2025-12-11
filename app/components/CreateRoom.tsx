'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useGameStore } from '@/app/store/gameStore';
import { generateRoomCode } from '@/app/lib/utils';
import { ArrowLeft } from 'lucide-react';

export default function CreateRoom({ onBack }: { onBack: () => void }) {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setRoom, setCurrentPlayer } = useGameStore();

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      const playerId = `player_${Date.now()}`;
      
      const newRoom = {
        code: roomCode,
        leaderId: playerId,
        players: [{
          id: playerId,
          name: playerName,
          isLeader: true,
          isImpostor: false,
          score: 0
        }],
        settings: {
          impostorCount: 1,
          category: 'Animales',
          customCategories: [],
          roundCount: 3,
          clueTime: 20
        },
        state: 'lobby',
        currentRound: 0,
        createdAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'rooms'), newRoom);
      
      setRoom({ ...newRoom, id: docRef.id });
      setCurrentPlayer(newRoom.players[0]);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Error al crear la sala');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-gray-300 mb-4"
        >
          <ArrowLeft className="mr-2" />
          Volver
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Crear Nueva Sala
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tu Nombre
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
              />
            </div>

            <button
              onClick={handleCreate}
              disabled={!playerName.trim() || loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'Creando...' : '🎮 Crear Sala'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
