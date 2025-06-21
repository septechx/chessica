import { useRef, useState } from "react";

type PieceType =
  | "rook"
  | "knight"
  | "bishop"
  | "king"
  | "queen"
  | "pawn"
  | "dot";
type Color = "white" | "black" | "dot";

type Piece = {
  color: Color;
  piece: PieceType;
};
type BoardMap = Map<number, Piece | null>;

function createInitialBoard(): BoardMap {
  const board: BoardMap = new Map();

  const backRank: PieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];

  for (let col = 0; col < 8; col++) {
    board.set(col, { color: "white", piece: backRank[col] });
    board.set(10 + col, { color: "white", piece: "pawn" });
  }

  for (let col = 0; col < 8; col++) {
    board.set(60 + col, { color: "black", piece: "pawn" });
    board.set(70 + col, { color: "black", piece: backRank[col] });
  }

  for (let row = 2; row <= 5; row++) {
    for (let col = 0; col < 8; col++) {
      board.set(row * 10 + col, null);
    }
  }

  return board;
}

function fetchPiece(piece: Piece): string {
  if (piece.color === "dot") {
    return `http://localhost:5173/dot.svg`;
  }

  return `http://localhost:5173/${piece.color}_${piece.piece}.svg`;
}

function Board() {
  const player_color = "black";

  const [isMoving, setIsMoving] = useState<number>(-1);
  const [, setStep] = useState<number>(0);
  const board = useRef<BoardMap>(createInitialBoard()).current;

  function render() {
    setStep((p) => p + 1);
  }

  function clearDots() {
    board.forEach((val, key) => {
      if (val?.color == "dot") {
        board.set(key, null);
      }
    });
  }

  function startMove(x: number, y: number) {
    const piece = board.get(x * 10 + y) as Piece;

    if (piece.color === "dot") {
      board.set(x * 10 + y, board.get(isMoving)!);
      board.set(isMoving, null);
      clearDots();
      setIsMoving(-1);
      return;
    }

    if (piece.color !== player_color) return;
    if (isMoving !== -1) {
      if (isMoving !== x * 10 + y) {
        return;
      } else {
        clearDots();
        setIsMoving(-1);
        return;
      }
    }

    switch (piece.piece) {
      case "pawn":
        if (
          board.get((x - 1) * 10 + y) !== null ||
          (x === 6 && board.get((x - 2) * 10 + y) !== null)
        ) {
          return;
        }
        if (x === 6) {
          board.set((x - 2) * 10 + y, { piece: "dot", color: "dot" });
        }
        board.set((x - 1) * 10 + y, { piece: "dot", color: "dot" });
        break;
      case "rook": {
        // Up
        for (let i = x - 1; i >= 0; i--) {
          const target = board.get(i * 10 + y);
          if (target === null) {
            board.set(i * 10 + y, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Down
        for (let i = x + 1; i < 8; i++) {
          const target = board.get(i * 10 + y);
          if (target === null) {
            board.set(i * 10 + y, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Left
        for (let j = y - 1; j >= 0; j--) {
          const target = board.get(x * 10 + j);
          if (target === null) {
            board.set(x * 10 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Right
        for (let j = y + 1; j < 8; j++) {
          const target = board.get(x * 10 + j);
          if (target === null) {
            board.set(x * 10 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "bishop": {
        // Diagonals
        for (let d = 1; x - d >= 0 && y - d >= 0; d++) {
          const target = board.get((x - d) * 10 + (y - d));
          if (target === null) {
            board.set((x - d) * 10 + (y - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x - d >= 0 && y + d < 8; d++) {
          const target = board.get((x - d) * 10 + (y + d));
          if (target === null) {
            board.set((x - d) * 10 + (y + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x + d < 8 && y - d >= 0; d++) {
          const target = board.get((x + d) * 10 + (y - d));
          if (target === null) {
            board.set((x + d) * 10 + (y - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x + d < 8 && y + d < 8; d++) {
          const target = board.get((x + d) * 10 + (y + d));
          if (target === null) {
            board.set((x + d) * 10 + (y + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "queen": {
        // Queen = rook + bishop
        // Rook moves
        for (let i = x - 1; i >= 0; i--) {
          const target = board.get(i * 10 + y);
          if (target === null) {
            board.set(i * 10 + y, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let i = x + 1; i < 8; i++) {
          const target = board.get(i * 10 + y);
          if (target === null) {
            board.set(i * 10 + y, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let j = y - 1; j >= 0; j--) {
          const target = board.get(x * 10 + j);
          if (target === null) {
            board.set(x * 10 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let j = y + 1; j < 8; j++) {
          const target = board.get(x * 10 + j);
          if (target === null) {
            board.set(x * 10 + j, { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        // Bishop moves
        for (let d = 1; x - d >= 0 && y - d >= 0; d++) {
          const target = board.get((x - d) * 10 + (y - d));
          if (target === null) {
            board.set((x - d) * 10 + (y - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x - d >= 0 && y + d < 8; d++) {
          const target = board.get((x - d) * 10 + (y + d));
          if (target === null) {
            board.set((x - d) * 10 + (y + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x + d < 8 && y - d >= 0; d++) {
          const target = board.get((x + d) * 10 + (y - d));
          if (target === null) {
            board.set((x + d) * 10 + (y - d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        for (let d = 1; x + d < 8 && y + d < 8; d++) {
          const target = board.get((x + d) * 10 + (y + d));
          if (target === null) {
            board.set((x + d) * 10 + (y + d), { piece: "dot", color: "dot" });
          } else {
            break;
          }
        }
        break;
      }
      case "king": {
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1],
        ];
        for (const [dx, dy] of kingMoves) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            const target = board.get(nx * 10 + ny);
            if (target === null) {
              board.set(nx * 10 + ny, { piece: "dot", color: "dot" });
            }
          }
        }
        break;
      }
      case "knight": {
        const knightMoves = [
          [-2, -1], [-2, 1],
          [-1, -2], [-1, 2],
          [1, -2], [1, 2],
          [2, -1], [2, 1],
        ];
        for (const [dx, dy] of knightMoves) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
            const target = board.get(nx * 10 + ny);
            if (target === null) {
              board.set(nx * 10 + ny, { piece: "dot", color: "dot" });
            }
          }
        }
        break;
      }
      default:
        return;
    }

    setIsMoving(x * 10 + y);
  }

  return (
    <div className="flex flex-row max-w-160 border-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div className="flex flex-col" key={i}>
          {Array.from({ length: 8 }, (__, j) => (
            <div
              className="w-20 h-20 border-2 flex justify-center items-center"
              key={j}
            >
              {board.get(j * 10 + i) === null ? (
                <div></div>
              ) : (
                <div onClick={() => startMove(j, i)}>
                  <img
                    alt={`${board.get(j * 10 + i)?.color} ${board.get(j * 10 + i)?.piece}`}
                    src={fetchPiece(board.get(j * 10 + i)!)}
                    height={board.get(j * 10 + i)!.color === "dot" ? 32 : 64}
                    width={board.get(j * 10 + i)!.color === "dot" ? 32 : 64}
                  //draggable={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Board;
