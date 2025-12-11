'use client';

import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { generateWord, selectImpostors } from '@/app/lib/utils';
import { Users, Crown, Settings } from 'lucide-react';

export default function Lobby() {
  const { room, currentPlayer } = useGameStore();
  
  if (!room || !currentPlayer) return null;

  const isLeader = currentPlayer.id === room.leaderId;

    const updateImpostorCount = async (count: number) => {
    if (!isLeader) return;
    await updateDoc(doc(db, 'rooms', room.id), {
      'settings.impostorCount': count
    });
  };

  const updateCategory = async (category: string) => {
    if (!isLeader) return;
    await updateDoc(doc(db, 'rooms', room.id), {
      'settings.category': category
    });
  };

  const startGame = async () => {
    if (!isLeader || room.players.length < 3) {
      alert('Se necesitan al menos 3 jugadores');
      return;
    }

    const word = generateWord(room.settings.category);
    const impostorIds = selectImpostors(
      room.players.map(p => p.id),
      room.settings.impostorCount
    );

    const updatedPlayers = room.players.map(player => ({
      ...player,
      isImpostor: impostorIds.includes(player.id),
      clue: '',
      votedFor: ''
    }));

    await updateDoc(doc(db, 'rooms', room.id), {
      state: 'round',
      currentRound: 1,
      currentWord: word,
      players: updatedPlayers,
      roundStartTime: Date.now()
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">🎮 Sala de Espera</h1>
            <div className="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block text-3xl font-mono tracking-widest">
              {room.code}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Users size={20} />
                <span className="font-semibold">Jugadores ({room.players.length})</span>
              </div>
              {isLeader && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Crown size={20} />
                  <span>Líder</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-white/20 rounded-lg p-3 flex items-center justify-between"
                >
                  <span className="text-white font-medium">{player.name}</span>
                  {player.isLeader && (
                    <Crown className="text-yellow-400" size={20} />
                  )}
                </div>
              ))}
            </div>

            {isLeader && (
              <div className="pt-4 space-y-3">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-white mb-3">
                    <Settings size={20} />
                    <span className="font-semibold">Configuración</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-gray-300">
                  <div className="font-semibold">Impostores:</div>
                  <select
                    value={room.settings.impostorCount}
                    onChange={(e) => updateImpostorCount(Number(e.target.value))}
                    className="bg-white/10 text-white rounded px-2 py-1 cursor-pointer"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </div>
                                <div className="text-gray-300">
                  <div className="font-semibold">Categoría:</div>
                  <select
                    value={room.settings.category}
                    onChange={(e) => updateCategory(e.target.value)}
                    className="bg-white/10 text-white rounded px-2 py-1 cursor-pointer"
                  >
                    <option value="Animales">Animales</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Países">Países</option>
                    <option value="Objetos">Objetos</option>
                    <option value="Profesiones">Profesiones</option>
                  </select>
                </div>
                <div className="text-gray-300">
                      <div className="font-semibold">Rondas:</div>
                      <div>{room.settings.roundCount}</div>
                    </div>
                    <div className="text-gray-300">
                      <div className="font-semibold">Tiempo:</div>
                      <div>{room.settings.clueTime}s</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={startGame}
                  disabled={room.players.length < 3}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition-all"
                >
                  {room.players.length < 3 
                    ? 'Esperando jugadores (mín. 3)' 
                    : '🚀 Iniciar Partida'}
                </button>
              </div>
            )}

            {!isLeader && (
              <div className="text-center text-gray-300 py-4">
                Esperando a que el líder inicie la partida...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
