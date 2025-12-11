'use client';

import { useEffect, useMemo } from 'react';
import { useGameStore } from '@/app/store/gameStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { generateWord, selectImpostors } from '@/app/lib/utils';
import { Trophy, Target } from 'lucide-react';

export default function Results() {
  const { room, currentPlayer } = useGameStore();

  const votingResults = useMemo(() => {
    if (!room) return { mostVoted: null, votes: {} };

    const votes: { [key: string]: number } = {};
    room.players.forEach(p => {
      if (p.votedFor) {
        votes[p.votedFor] = (votes[p.votedFor] || 0) + 1;
      }
    });

    const mostVoted = Object.keys(votes).reduce((a, b) => (votes[a] > votes[b] ? a : b), '');

    return votingResults({ mostVoted, votes });
  }, [room]);

  if (!room || !votingResults) return null;

  const impostor = room.players.find(p => p.isImpostor);
  const correctVote = votingResults.mostVoted === impostor?.name;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-8">
      <Trophy className="w-24 h-24 mb-8 text-yellow-400" />
      <h1 className="text-4xl font-bold mb-8">Resultados de la Votación</h1>
      
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 w-full max-w-md mb-6">
        <h2 className="text-2xl font-bold mb-4">El más votado:</h2>
        <p className="text-3xl text-yellow-400">{votingResults.mostVoted}</p>
      </div>

      {correctVote ? (
        <div className="bg-green-500/20 backdrop-blur-md rounded-lg p-6 w-full max-w-md mb-6">
          <Target className="w-12 h-12 mb-2 text-green-400 mx-auto" />
          <p className="text-2xl font-bold text-center">¡Votaron correctamente!</p>
          <p className="text-center mt-2">El impostor era {impostor?.name}</p>
        </div>
      ) : (
        <div className="bg-red-500/20 backdrop-blur-md rounded-lg p-6 w-full max-w-md mb-6">
          <Target className="w-12 h-12 mb-2 text-red-400 mx-auto" />
          <p className="text-2xl font-bold text-center">¡Votaron incorrectamente!</p>
          <p className="text-center mt-2">El impostor era {impostor?.name}</p>
        </div>
      )}
    </div>
  );
}
