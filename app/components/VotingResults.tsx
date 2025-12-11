'use client';
import { useGameStore } from '@/app/store/gameStore';

export default function VotingResults() {
  const { room } = useGameStore();

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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            📊 Resultados de Votación
          </h1>

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
                return (
                  <div key={player.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-white font-semibold">{player.name}</span>
                    <span className="text-yellow-400 font-bold text-lg">{votes} voto{votes !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jugador eliminado */}
          {eliminatedPlayer && (
            <div className="bg-red-600/30 border-2 border-red-500 rounded-lg p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Jugador Eliminado:</h2>
              <div className="text-5xl font-bold text-red-400 mb-4">{eliminatedPlayer.name}</div>
              <div className="text-2xl font-semibold">
                Rol: <span className={eliminatedPlayer.isImpostor ? "text-red-300" : "text-blue-300"}>
                  {eliminatedPlayer.isImpostor ? '🔴 Impostor' : '🔵 Civil'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}