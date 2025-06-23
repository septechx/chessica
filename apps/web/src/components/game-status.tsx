import type { Color, GameState } from "@chessica/protocol";

interface GameStatusProps {
  connected: boolean;
  assignedColor: Color | null;
  waitingForPlayers: boolean;
  connectedCount: number;
  gameStarted: boolean;
  gameState: GameState | null;
}

export function GameStatus({
  connected,
  assignedColor,
  waitingForPlayers,
  connectedCount,
  gameStarted,
  gameState,
}: GameStatusProps) {
  return (
    <div className="mb-4 flex gap-4 items-center">
      <div
        className={`px-3 py-1 rounded ${connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {connected ? "Connected" : "Disconnected"}
      </div>

      {assignedColor && (
        <div className="px-3 py-1 rounded bg-blue-100 text-blue-800">
          Playing as: {assignedColor}
        </div>
      )}

      {waitingForPlayers && (
        <div className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">
          Waiting for players: {connectedCount}/2
        </div>
      )}

      {gameStarted && (
        <div className="px-3 py-1 rounded bg-green-100 text-green-800">
          Game Started!
        </div>
      )}

      {gameState && gameStarted && (
        <div className="text-sm">Turn: {gameState.turn}</div>
      )}
    </div>
  );
}
