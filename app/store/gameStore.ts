import { create } from 'zustand';
import { Room, Player } from '@/app/types/game';

interface GameStore {
  room: Room | null;
  currentPlayer: Player | null;
  setRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  updateRoom: (updates: Partial<Room>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  room: null,
  currentPlayer: null,
  setRoom: (room) => set({ room }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  updateRoom: (updates) => set((state) => ({
    room: state.room ? { ...state.room, ...updates } : null
  })),
}));
