import { useRef, useState, useEffect } from "react";
import type { Color, Move } from "@chessica/protocol";
import { useChessWebSocket } from "@/hooks/use-chess-websocket";
import { GameStatus } from "./ui/game-status";
import { ChessBoard } from "./ui/chess-board";
import {
  createInitialBoard,
  arrayToBoard,
  clearDots,
  calculateMoves,
  type BoardMap
} from "@/lib/board-utils";

function Board() {
  const [isMoving, setIsMoving] = useState<number>(-1);
  const [, setStep] = useState<number>(0);
  const board = useRef<BoardMap>(createInitialBoard("White")).current;

  const {
    connected,
    assignedColor,
    gameStarted,
    waitingForPlayers,
    connectedCount,
    gameState,
    sendMove
  } = useChessWebSocket();

  // Initialize board when assigned color is set
  useEffect(() => {
    if (assignedColor && !gameState) {
      // Only initialize board if we don't have game state from server
      const newBoard = createInitialBoard(assignedColor);
      board.clear();
      newBoard.forEach((v, k) => board.set(k, v));
      setStep((p) => p + 1);
    }
  }, [assignedColor, gameState, board]);

  // Update board when game state changes
  useEffect(() => {
    if (gameState) {
      // Update local board from server state (server always sends standard orientation)
      const newBoard = arrayToBoard(gameState.board);
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
    }
  }, [gameState, assignedColor, board]);

  function render() {
    setStep((p) => p + 1);
  }

  function handleSquareClick(rank: number, file: number) {
    // Only allow moves if game is started and it's the player's turn
    if (!gameStarted || !assignedColor || !gameState || gameState.turn !== assignedColor) {
      return;
    }

    const index = rank * 8 + file;
    const piece = board.get(index);

    // Simple test: log when Black player clicks on their pieces
    if (assignedColor === "Black" && piece?.color === "Black") {
      console.log(`Black player clicked on ${piece.piece} at (${rank}, ${file}) -> index ${index}`);
    }

    if (piece?.color === "dot") {
      // Make the move
      const fromIndex = isMoving;
      const toIndex = index;

      const move: Move = {
        from: fromIndex as any,
        to: toIndex as any
      };

      // Send move to server
      sendMove(move);

      board.set(index, board.get(isMoving)!);
      board.set(isMoving, null);
      clearDots(board);
      setIsMoving(-1);
      return;
    }

    if (!piece || piece.color !== assignedColor) {
      return;
    }

    if (isMoving !== -1) {
      if (isMoving !== index) {
        return;
      } else {
        clearDots(board);
        setIsMoving(-1);
        return;
      }
    }

    // Calculate possible moves
    calculateMoves(board, rank, file, piece, assignedColor);
    setIsMoving(index);
  }

  return (
    <div>
      <GameStatus
        connected={connected}
        assignedColor={assignedColor}
        waitingForPlayers={waitingForPlayers}
        connectedCount={connectedCount}
        gameStarted={gameStarted}
        gameState={gameState}
      />

      <ChessBoard
        board={board}
        assignedColor={assignedColor}
        onSquareClick={handleSquareClick}
      />
    </div>
  );
}

export default Board;
