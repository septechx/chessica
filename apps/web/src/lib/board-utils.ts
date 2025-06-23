import type { PieceType, Color, Piece } from "@chessica/protocol";

export type UIPiece = Piece | { color: "dot"; piece: "dot" };
export type BoardMap = Map<number, UIPiece | null>;

export function boardToArray(board: BoardMap): (Piece | null)[] {
  const array = new Array(64).fill(null);
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = board.get(index);
      if (piece && piece.color !== "dot") {
        array[index] = piece as Piece;
      }
    }
  }
  return array;
}

export function arrayToBoard(array: (Piece | null)[]): BoardMap {
  const board: BoardMap = new Map();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      board.set(index, array[index]);
    }
  }
  return board;
}

export function getBoardIndex(
  rank: number,
  file: number,
  playerColor: Color,
): number {
  if (playerColor === "Black") {
    return (7 - rank) * 8 + (7 - file);
  }
  return rank * 8 + file;
}

export function getRankFile(
  index: number,
  playerColor: Color,
): [number, number] {
  if (playerColor === "Black") {
    const rank = 7 - Math.floor(index / 8);
    const file = 7 - (index % 8);
    return [rank, file];
  }
  const rank = Math.floor(index / 8);
  const file = index % 8;
  return [rank, file];
}

export function createInitialBoard(playerColor: Color): BoardMap {
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

  for (let col = 0; col < 8; col++) {
    board.set(whiteRows[0] * 8 + col, { color: "White", piece: backRank[col] });
    board.set(whiteRows[1] * 8 + col, { color: "White", piece: "Pawn" });
  }

  for (let col = 0; col < 8; col++) {
    board.set(blackRows[1] * 8 + col, { color: "Black", piece: "Pawn" });
    board.set(blackRows[0] * 8 + col, { color: "Black", piece: backRank[col] });
  }

  const emptyRows = Array.from({ length: 8 }, (_, i) => i).filter(
    (row) => !whiteRows.includes(row) && !blackRows.includes(row),
  );
  for (const row of emptyRows) {
    for (let col = 0; col < 8; col++) {
      board.set(row * 8 + col, null);
    }
  }

  return board;
}

export function fetchPiece(piece: UIPiece): string {
  if (piece.color === "dot") {
    return `/dot.svg`;
  }

  const color = piece.color.toLowerCase();
  const pieceType = piece.piece.toLowerCase();
  return `/${color}_${pieceType}.svg`;
}

export function clearDots(board: BoardMap): void {
  board.forEach((val, key) => {
    if (val?.color === "dot") {
      board.set(key, null);
    }
  });
}

export function calculateMoves(
  board: BoardMap,
  x: number,
  y: number,
  piece: UIPiece,
  assignedColor: Color,
): void {
  const calcX = x;
  const calcY = y;

  switch (piece.piece) {
    case "Pawn":
      calculatePawnMoves(board, calcX, calcY, assignedColor);
      break;
    case "Rook":
      calculateRookMoves(board, calcX, calcY);
      break;
    case "Bishop":
      calculateBishopMoves(board, calcX, calcY);
      break;
    case "Queen":
      calculateQueenMoves(board, calcX, calcY);
      break;
    case "King":
      calculateKingMoves(board, calcX, calcY);
      break;
    case "Knight":
      calculateKnightMoves(board, calcX, calcY);
      break;
  }
}

function calculatePawnMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
  assignedColor: Color,
): void {
  if (assignedColor === "White") {
    if (board.get((calcX - 1) * 8 + calcY) !== null) {
      return;
    }
    if (calcX === 6 && board.get((calcX - 2) * 8 + calcY) !== null) {
      // Can only move 1 square (blocked)
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
    if (board.get((calcX + 1) * 8 + calcY) !== null) {
      return;
    }
    if (calcX === 1 && board.get((calcX + 2) * 8 + calcY) !== null) {
      // Can only move 1 square (blocked)
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
}

function calculateRookMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
): void {
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
}

function calculateBishopMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
): void {
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
}

function calculateQueenMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
): void {
  // Queen = rook + bishop
  calculateRookMoves(board, calcX, calcY);
  calculateBishopMoves(board, calcX, calcY);
}

function calculateKingMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
): void {
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
}

function calculateKnightMoves(
  board: BoardMap,
  calcX: number,
  calcY: number,
): void {
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
}
