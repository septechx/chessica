import type { Color } from "@chessica/protocol";
import { fetchPiece, type UIPiece } from "@/lib/board-utils";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className={cn(
        "w-20 h-20 border-2 border-background flex justify-center items-center relative bg-gray-400",
        { "bg-gray-300": isLight },
      )}
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
