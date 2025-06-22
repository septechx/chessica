import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import type { PieceType, Color, Piece, Move, GameState, ClientMessage, ServerMessage } from "@chessica/protocol";

// Extended piece type for UI dots
type UIPiece = Piece | { color: "dot"; piece: "dot" };
type BoardMap = Map<number, UIPiece | null>;

// Convert between board representations - now using same coordinate system as server
function boardToArray(board: BoardMap): (Piece | null)[] {
  const array = new Array(64).fill(null);
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = board.get(index);
      // Only include actual pieces, not dots
      if (piece && piece.color !== "dot") {
        array[index] = piece as Piece;
      }
    }
  }
  return array;
}

function arrayToBoard(array: (Piece | null)[]): BoardMap {
  const board: BoardMap = new Map();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      board.set(index, array[index]);
    }
  }
  return board;
}

// Convert coordinates based on player perspective
function getBoardIndex(rank: number, file: number, playerColor: Color): number {
  if (playerColor === "Black") {
    // Flip the board for Black player
    return (7 - rank) * 8 + (7 - file);
  }
  return rank * 8 + file;
}

function getRankFile(index: number, playerColor: Color): [number, number] {
  if (playerColor === "Black") {
    // Flip the coordinates for Black player
    const rank = 7 - Math.floor(index / 8);
    const file = 7 - (index % 8);
    return [rank, file];
  }
  const rank = Math.floor(index / 8);
  const file = index % 8;
  return [rank, file];
}

function createInitialBoard(playerColor: Color): BoardMap {
  const board: BoardMap = new Map();

  let backRank: PieceType[];
  if (playerColor === "White") {
    backRank = [
      "Rook",
      "Knight",
      "Bishop",
      "Queen",
      "King",
      "Bishop",
      "Knight",
      "Rook",
    ];
  } else {
    backRank = [
      "Rook",
      "Knight",
      "Bishop",
      "King",
      "Queen",
      "Bishop",
      "Knight",
      "Rook",
    ];
  }

  let whiteRows, blackRows;
  if (playerColor === "White") {
    whiteRows = [7, 6];
    blackRows = [0, 1];
  } else {
    whiteRows = [0, 1];
    blackRows = [7, 6];
  }

  // Place white pieces
  for (let col = 0; col < 8; col++) {
    board.set(whiteRows[0] * 8 + col, { color: "White", piece: backRank[col] });
    board.set(whiteRows[1] * 8 + col, { color: "White", piece: "Pawn" });
  }

  // Place black pieces
  for (let col = 0; col < 8; col++) {
    board.set(blackRows[1] * 8 + col, { color: "Black", piece: "Pawn" });
    board.set(blackRows[0] * 8 + col, { color: "Black", piece: backRank[col] });
  }

  // Fill empty squares
  const emptyRows = Array.from({ length: 8 }, (_, i) => i).filter(
    (row) => !whiteRows.includes(row) && !blackRows.includes(row)
  );
  for (const row of emptyRows) {
    for (let col = 0; col < 8; col++) {
      board.set(row * 8 + col, null);
    }
  }

  return board;
}

function fetchPiece(piece: UIPiece): string {
  if (piece.color === "dot") {
    return `http://localhost:5173/dot.svg`;
  }

  // Convert PascalCase to lowercase for file names
  const color = piece.color.toLowerCase();
  const pieceType = piece.piece.toLowerCase();
  return `http://localhost:5173/${color}_${pieceType}.svg`;
}

function Board() {
  const [playerColor, setPlayerColor] = useState<Color>("White");
  const [assignedColor, setAssignedColor] = useState<Color | null>(null);
  const [isMoving, setIsMoving] = useState<number>(-1);
  const [, setStep] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);
  const board = useRef<BoardMap>(createInitialBoard("White")).current;

  // Initialize board when assigned color is set
  useEffect(() => {
    if (assignedColor && !gameState) {
      // Only initialize board if we don't have game state from server
      const newBoard = createInitialBoard(assignedColor);
      board.clear();
      newBoard.forEach((v, k) => board.set(k, v));
      setStep((p) => p + 1);
    }
  }, [assignedColor, gameState]);

  // WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000/ws");

    websocket.onopen = () => {
      console.log("Connected to game server");
      setConnected(true);
      // Join the game
      const joinMessage: ClientMessage = {
        type: "JoinGame",
        game_id: "default"
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
            // Update local board from server state (server always sends standard orientation)
            const newBoard = arrayToBoard(message.state.board);
            board.clear();
            newBoard.forEach((v, k) => board.set(k, v));

            // Test: log Black pieces in the board
            if (assignedColor === "Black") {
              console.log("Board received from server:");
              for (let i = 0; i < 64; i++) {
                const piece = board.get(i);
                if (piece?.color === "Black") {
                  const rank = Math.floor(i / 8);
                  const file = i % 8;
                  console.log(`Black ${piece.piece} at (${rank}, ${file}) -> index ${i}`);
                }
              }
            }

            setStep((p) => p + 1);
            break;
          case "MoveMade":
            // Handle move made by opponent
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

  function render() {
    setStep((p) => p + 1);
  }

  function clearDots() {
    board.forEach((val, key) => {
      if (val?.color === "dot") {
        board.set(key, null);
      }
    });
  }

  function startMove(x: number, y: number) {
    // Only allow moves if game is started and it's the player's turn
    if (!gameStarted || !assignedColor || !gameState || gameState.turn !== assignedColor) {
      return;
    }

    const index = x * 8 + y;
    const piece = board.get(index) as UIPiece;

    // Simple test: log when Black player clicks on their pieces
    if (assignedColor === "Black" && piece?.color === "Black") {
      console.log(`Black player clicked on ${piece.piece} at (${x}, ${y}) -> index ${index}`);
    }

    if (piece.color === "dot") {
      // Make the move
      const fromIndex = isMoving;
      const toIndex = index;

      const move: Move = {
        from: fromIndex as any,
        to: toIndex as any
      };

      // Send move to server
      if (ws && connected) {
        const moveMessage: ClientMessage = {
          type: "MakeMove",
          move_: move
        };
        ws.send(JSON.stringify(moveMessage));
      }

      board.set(index, board.get(isMoving)!);
      board.set(isMoving, null);
      clearDots();
      setIsMoving(-1);
      return;
    }

    if (piece.color !== assignedColor) {
      return;
    }
    if (isMoving !== -1) {
      if (isMoving !== index) {
        return;
      } else {
        clearDots();
        setIsMoving(-1);
        return;
      }
    }

    // Use the coordinates directly - they're already in the correct board coordinate system
    const calcX = x;
    const calcY = y;

    switch (piece.piece) {
      case "Pawn":
        if (assignedColor === "White") {
          // Check if 1 square ahead is blocked
          if (board.get((calcX - 1) * 8 + calcY) !== null) {
            return;
          }
          // If on starting rank, also check 2 squares ahead
          if (calcX === 6 && board.get((calcX - 2) * 8 + calcY) !== null) {
            // Can only move 1 square
            board.set((calcX - 1) * 8 + calcY, { piece: "dot", color: "dot" });
          } else if (calcX === 6) {
            // Can move both 1 and 2 squares
            board.set((calcX - 2) * 8 + calcY, { piece: "dot", color: "dot" });
            board.set((calcX - 1) * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            // Can only move 1 square (not on starting rank)
            board.set((calcX - 1) * 8 + calcY, { piece: "dot", color: "dot" });
          }
        } else {
          // Black pawn moves down (increasing rank)
          // Check if 1 square ahead is blocked
          if (board.get((calcX + 1) * 8 + calcY) !== null) {
            return;
          }
          // If on starting rank, also check 2 squares ahead
          if (calcX === 1 && board.get((calcX + 2) * 8 + calcY) !== null) {
            // Can only move 1 square
            board.set((calcX + 1) * 8 + calcY, { piece: "dot", color: "dot" });
          } else if (calcX === 1) {
            // Can move both 1 and 2 squares
            board.set((calcX + 2) * 8 + calcY, { piece: "dot", color: "dot" });
            board.set((calcX + 1) * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            // Can only move 1 square (not on starting rank)
            board.set((calcX + 1) * 8 + calcY, { piece: "dot", color: "dot" });
          }
        }
        break;
      case "Rook": {
        // Up
        for (let i = calcX - 1; i >= 0; i--) {
          const target = board.get(i * 8 + calcY);
          if (target === null) {
            board.set(i * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Down
        for (let i = calcX + 1; i < 8; i++) {
          const target = board.get(i * 8 + calcY);
          if (target === null) {
            board.set(i * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Left
        for (let j = calcY - 1; j >= 0; j--) {
          const target = board.get(calcX * 8 + j);
          if (target === null) {
            board.set(calcX * 8 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Right
        for (let j = calcY + 1; j < 8; j++) {
          const target = board.get(calcX * 8 + j);
          if (target === null) {
            board.set(calcX * 8 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "Bishop": {
        // Diagonals
        for (let d = 1; calcX - d >= 0 && calcY - d >= 0; d++) {
          const target = board.get((calcX - d) * 8 + (calcY - d));
          if (target === null) {
            board.set((calcX - d) * 8 + (calcY - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX - d >= 0 && calcY + d < 8; d++) {
          const target = board.get((calcX - d) * 8 + (calcY + d));
          if (target === null) {
            board.set((calcX - d) * 8 + (calcY + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX + d < 8 && calcY - d >= 0; d++) {
          const target = board.get((calcX + d) * 8 + (calcY - d));
          if (target === null) {
            board.set((calcX + d) * 8 + (calcY - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX + d < 8 && calcY + d < 8; d++) {
          const target = board.get((calcX + d) * 8 + (calcY + d));
          if (target === null) {
            board.set((calcX + d) * 8 + (calcY + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "Queen": {
        // Queen = rook + bishop
        // Rook moves
        for (let i = calcX - 1; i >= 0; i--) {
          const target = board.get(i * 8 + calcY);
          if (target === null) {
            board.set(i * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let i = calcX + 1; i < 8; i++) {
          const target = board.get(i * 8 + calcY);
          if (target === null) {
            board.set(i * 8 + calcY, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let j = calcY - 1; j >= 0; j--) {
          const target = board.get(calcX * 8 + j);
          if (target === null) {
            board.set(calcX * 8 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let j = calcY + 1; j < 8; j++) {
          const target = board.get(calcX * 8 + j);
          if (target === null) {
            board.set(calcX * 8 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Bishop moves
        for (let d = 1; calcX - d >= 0 && calcY - d >= 0; d++) {
          const target = board.get((calcX - d) * 8 + (calcY - d));
          if (target === null) {
            board.set((calcX - d) * 8 + (calcY - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX - d >= 0 && calcY + d < 8; d++) {
          const target = board.get((calcX - d) * 8 + (calcY + d));
          if (target === null) {
            board.set((calcX - d) * 8 + (calcY + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX + d < 8 && calcY - d >= 0; d++) {
          const target = board.get((calcX + d) * 8 + (calcY - d));
          if (target === null) {
            board.set((calcX + d) * 8 + (calcY - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; calcX + d < 8 && calcY + d < 8; d++) {
          const target = board.get((calcX + d) * 8 + (calcY + d));
          if (target === null) {
            board.set((calcX + d) * 8 + (calcY + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "King": {
        const kingMoves = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];
        for (const [dx, dy] of kingMoves) {
          const nx = calcX + dx,
            ny = calcY + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            const target = board.get(nx * 8 + ny);
            if (target === null) {
              board.set(nx * 8 + ny, { piece: "dot", color: "dot" });
            }
          }
        }
        break;
      }
      case "Knight": {
        const knightMoves = [
          [-2, -1],
          [-2, 1],
          [-1, -2],
          [-1, 2],
          [1, -2],
          [1, 2],
          [2, -1],
          [2, 1],
        ];
        for (const [dx, dy] of knightMoves) {
          const nx = calcX + dx,
            ny = calcY + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            const target = board.get(nx * 8 + ny);
            if (target === null) {
              board.set(nx * 8 + ny, { piece: "dot", color: "dot" });
            }
          }
        }
        break;
      }
      default:
        return;
    }

    setIsMoving(index);
  }

  return (
    <div>
      <div className="mb-4 flex gap-4 items-center">
        <div className={`px-3 py-1 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
        {assignedColor && (
          <div className="px-3 py-1 rounded bg-blue-100 text-blue-800">
            Playing as: {assignedColor} (Your pieces at bottom)
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
          <div className="text-sm">
            Turn: {gameState.turn}
          </div>
        )}
      </div>
      <div className="flex flex-row max-w-160 border-2">
        {Array.from({ length: 8 }, (_, j) => (
          <div className="flex flex-col" key={j}>
            {Array.from({ length: 8 }, (__, i) => {
              const isLight = (i + j) % 2 === 0;
              const squareBg = isLight ? "bg-gray-300" : "bg-gray-400";

              // Use flipped coordinates for Black player
              const [rank, file] = assignedColor === "Black"
                ? [7 - i, 7 - j]
                : [i, j];
              const index = rank * 8 + file;

              return (
                <div
                  className={`w-20 h-20 border-2 flex justify-center items-center ${squareBg} relative`}
                  key={i}
                >
                  {/* Add rank/file labels for Black player */}
                  {assignedColor === "Black" && (
                    <>
                      {i === 0 && (
                        <div className="absolute top-1 left-1 text-xs text-gray-600">
                          {8 - j}
                        </div>
                      )}
                      {j === 0 && (
                        <div className="absolute bottom-1 right-1 text-xs text-gray-600">
                          {String.fromCharCode(97 + i)}
                        </div>
                      )}
                    </>
                  )}
                  {/* Add rank/file labels for White player */}
                  {assignedColor === "White" && (
                    <>
                      {i === 7 && (
                        <div className="absolute top-1 right-1 text-xs text-gray-600">
                          {j + 1}
                        </div>
                      )}
                      {j === 7 && (
                        <div className="absolute bottom-1 left-1 text-xs text-gray-600">
                          {String.fromCharCode(97 + i)}
                        </div>
                      )}
                    </>
                  )}
                  {board.get(index) === null ? (
                    <div></div>
                  ) : (
                    <div onClick={() => startMove(rank, file)}>
                      <img
                        alt={`${board.get(index)?.color} ${board.get(index)?.piece}`}
                        src={fetchPiece(board.get(index)!)}
                        height={board.get(index)!.color === "dot" ? 32 : 64}
                        width={board.get(index)!.color === "dot" ? 32 : 64}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;
