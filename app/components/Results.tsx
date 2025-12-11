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
        votes[p.votedFor] = (votes[p.votedFor]
