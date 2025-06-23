import { useRef, useState, useEffect } from "react";
import type { Move } from "@chessica/protocol";
import { useChessWebSocket } from "@/hooks/use-chess-websocket";
import { GameStatus } from "./game-status";
import { ChessBoard } from "./chess-board";
import {
  createInitialBoard,
  arrayToBoard,
  clearDots,
  calculateMoves,
  type BoardMap,
} from "@/lib/board-utils";
import { switch_color } from "@/lib/favicon-switcher";

function Board() {
  const [isMoving, setIsMoving] = useState<number>(-1);
  const [, setStep] = useState<number>(0);
  const board = useRef<BoardMap>(createInitialBoard("White")).current;

  const {
    connected,
    gameStarted,
    waitingForPlayers,
    assignedColor,
    connectedCount,
    gameState,
    sendMove,
  } = useChessWebSocket();

  useEffect(() => {
    if (assignedColor) {
      switch_color(assignedColor);
    }
  }, [assignedColor]);

  useEffect(() => {
    if (assignedColor && !gameState) {
      const newBoard = createInitialBoard(assignedColor);
      board.clear();
      newBoard.forEach((v, k) => board.set(k, v));
      setStep((p) => p + 1);
    }
  }, [assignedColor, gameState, board]);

  useEffect(() => {
    if (gameState) {
      const newBoard = arrayToBoard(gameState.board);
      board.clear();
      newBoard.forEach((v, k) => board.set(k, v));

      setStep((p) => p + 1);
    }
  }, [gameState, assignedColor, board]);

  function handleSquareClick(rank: number, file: number) {
    if (
      !gameStarted ||
      !assignedColor ||
      !gameState ||
      gameState.turn !== assignedColor
    ) {
      return;
    }

    const index = rank * 8 + file;
    const piece = board.get(index);

    if (piece?.color === "dot") {
      const fromIndex = isMoving;
      const toIndex = index;

      const move: Move = {
        from: fromIndex,
        to: toIndex,
      };

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
