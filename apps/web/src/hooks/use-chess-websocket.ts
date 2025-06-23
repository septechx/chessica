import { useState, useEffect, useCallback } from "react";
import type {
  Color,
  GameState,
  ClientMessage,
  ServerMessage,
  Move,
} from "@chessica/protocol";

interface UseChessWebSocketReturn {
  connected: boolean;
  assignedColor: Color | null;
  gameStarted: boolean;
  waitingForPlayers: boolean;
  connectedCount: number;
  gameState: GameState | null;
  sendMove: (move: Move) => void;
}

export function useChessWebSocket(): UseChessWebSocketReturn {
  const [assignedColor, setAssignedColor] = useState<Color | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);

  const sendMove = useCallback(
    (move: Move) => {
      if (ws && connected) {
        const moveMessage: ClientMessage = {
          type: "MakeMove",
          move_: move,
        };
        ws.send(JSON.stringify(moveMessage));
      }
    },
    [ws, connected],
  );

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000/ws");

    websocket.onopen = () => {
      console.log("Connected to game server");
      setConnected(true);
      const joinMessage: ClientMessage = {
        type: "JoinGame",
        game_id: "default",
      };
      websocket.send(JSON.stringify(joinMessage));
    };

    websocket.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        console.log("Received message:", message);

        switch (message.type) {
          case "ColorAssigned":
            setAssignedColor(message.color);
            console.log("Assigned color:", message.color);
            break;
          case "GameStarted":
            setGameStarted(true);
            setWaitingForPlayers(false);
            console.log("Game started!");
            break;
          case "WaitingForPlayers":
            setWaitingForPlayers(true);
            setConnectedCount(message.connected_count);
            console.log(`Waiting for players: ${message.connected_count}/2`);
            break;
          case "GameState":
            setGameState(message.state);
            console.log("Game state updated");
            break;
          case "MoveMade":
            console.log("Move made:", message.move_);
            break;
          case "Error":
            console.error("Server error:", message.message);
            break;
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    websocket.onclose = () => {
      console.log("Disconnected from game server");
      setConnected(false);
      setGameStarted(false);
      setWaitingForPlayers(false);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  return {
    connected,
    assignedColor,
    gameStarted,
    waitingForPlayers,
    connectedCount,
    gameState,
    sendMove,
  };
}
