'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Room } from '@/app/types/game';

// Components
import CreateRoom from '@/app/components/CreateRoom';
import JoinRoom from '@/app/components/JoinRoom';
import Lobby from '@/app/components/Lobby';
import GameRound from '@/app/components/GameRound';
import ShowClues from '@/app/components/ShowClues';
import Voting from '@/app/components/Voting';
import Results from '@/app/components/Results';
import FinalResults from '@/app/components/FinalResults';

export default function Home() {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const { room, setRoom } = useGameStore();

  useEffect(() => {
    if (!room) return;

    const unsubscribe = onSnapshot(doc(db, 'rooms', room.id), (doc) => {
      if (doc.exists()) {
        setRoom({ ...doc.data(), id: doc.id } as Room);
      }
    });

    return () => unsubscribe();
  }, [room?.id, setRoom]);

  if (room) {
    switch (room.state) {
      case 'lobby':
        return <Lobby />;
      case 'round':
        return <GameRound />;
      case 'clues':
        return <ShowClues />;
      case 'vote':
        return <Voting />;
      case 'results':
        return <Results />;
      case 'finish':
        return <FinalResults />;
    }
  }

  if (mode === 'create') {
    return <CreateRoom onBack={() => setMode('home')} />;
  }

  if (mode === 'join') {
    return <JoinRoom onBack={() => setMode('home')} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">🕵️ IMPOSTOR</h1>
          <p className="text-xl text-gray-300">Juego Multijugador</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setMode('create')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            🎮 Crear Sala
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105"
          >
            🚪 Unirse a Sala
          </button>
        </div>

        <div className="text-center text-gray-400 text-sm mt-8">
          <p>Creado con Next.js, Firebase y Vercel</p>
        </div>
      </div>
    </div>
  );
}
