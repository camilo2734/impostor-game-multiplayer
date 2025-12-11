export type GameState = 'lobby' | 'round' | 'clues' | 'vote' | 'results' | | 'votingResults' 'finish';

export interface Player {
  id: string;
  name: string;
  isLeader: boolean;
  isImpostor: boolean;
  clue?: string;
  votedFor?: string;
  score: number;
}

export interface GameSettings {
  impostorCount: number;
  category: string;
  customCategories: string[];
  roundCount: number;
  clueTime: number;
}

export interface Room {
  id: string;
  code: string;
  leaderId: string;
  players: Player[];
  settings: GameSettings;
  state: GameState;
  currentRound: number;
  currentWord?: string;
  createdAt: number;
  roundStartTime?: number;
    turnOrder?: string[];  // Array de IDs en orden aleatorio
  currentTurnIndex?: number;  // Índice del jugador actual
}
