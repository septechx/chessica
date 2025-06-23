import type { Color } from "@chessica/protocol";
import { fetchPiece, type UIPiece } from "@/lib/board-utils";

interface ChessSquareProps {
  rank: number;
  file: number;
  piece: UIPiece | null;
  assignedColor: Color | null;
  isLight: boolean;
  onClick: (rank: number, file: number) => void;
}

export function ChessSquare({
  rank,
  file,
  piece,
  isLight,
  onClick,
}: ChessSquareProps) {
  const squareBg = isLight ? "bg-gray-300" : "bg-gray-400";

  return (
    <div
      className={`w-20 h-20 border-2 border-background flex justify-center items-center ${squareBg} relative`}
      onClick={() => onClick(rank, file)}
    >
      {piece === null ? (
        <></>
      ) : (
        <img
          src={fetchPiece(piece)}
          alt={`${piece.color} ${piece.color === "dot" ? "" : piece.piece}`}
          height={piece.color === "dot" ? 32 : 64}
          width={piece.color === "dot" ? 32 : 64}
        />
      )}
    </div>
  );
}
