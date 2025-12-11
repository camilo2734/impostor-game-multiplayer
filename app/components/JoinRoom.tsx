'use client';

import { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useGameStore } from '@/app/store/gameStore';
import { ArrowLeft } from 'lucide-react';
import { Room } from '@/app/types/game';

export default function JoinRoom({ onBack }: { onBack: () => void }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setRoom, setCurrentPlayer } = useGameStore();

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    
    setLoading(true);
    try {
      const q = query(collection(db, 'rooms'), where('code', '==', roomCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Sala no encontrada');
        setLoading(false);
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = { ...roomDoc.data(), id: roomDoc.id } as Room;

      if (roomData.state !== 'lobby') {
        alert('La partida ya comenzó');
        setLoading(false);
        return;
      }

      const playerId = `player_${Date.now()}`;
      const newPlayer = {
        id: playerId,
        name: playerName,
        isLeader: false,
        isImpostor: false,
        score: 0
      };

      const updatedPlayers = [...roomData.players, newPlayer];
      
      await updateDoc(doc(db, 'rooms', roomDoc.id), {
        players: updatedPlayers
      });

      setRoom({ ...roomData, players: updatedPlayers });
      setCurrentPlayer(newPlayer);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Error al unirse a la sala');
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
            Unirse a Sala
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Código de Sala
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase text-center text-2xl font-bold tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!playerName.trim() || !roomCode.trim() || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? 'Uniéndose...' : '🚪 Unirse'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
