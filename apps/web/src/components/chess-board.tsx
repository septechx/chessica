import type { Color } from "@chessica/protocol";
import { ChessSquare } from "./chess-square";
import type { BoardMap } from "@/lib/board-utils";

interface ChessBoardProps {
  board: BoardMap;
  assignedColor: Color | null;
  onSquareClick: (rank: number, file: number) => void;
}

export function ChessBoard({
  board,
  assignedColor,
  onSquareClick,
}: ChessBoardProps) {
  return (
    <div className="flex flex-row max-w-160">
      <div className="flex flex-col ml-[-16px]">
        {Array.from({ length: 8 }, (_, i) => (
          <div className="h-20 flex items-center pr-1 font-bold" key={i}>
            {i}
          </div>
        ))}
      </div>
      {Array.from({ length: 8 }, (_, j) => (
        <div className="flex flex-col" key={j}>
          {Array.from({ length: 8 }, (__, i) => {
            const isLight = (i + j) % 2 === 0;

            const [rank, file] =
              assignedColor === "Black" ? [7 - i, 7 - j] : [i, j];
            const index = rank * 8 + file;
            const piece = board.get(index) ?? null;

            return (
              <ChessSquare
                key={i}
                rank={rank}
                file={file}
                piece={piece}
                assignedColor={assignedColor}
                isLight={isLight}
                onClick={onSquareClick}
              />
            );
          })}
          <div className="flex justify-center pt-1 font-bold">
            {(() => {
              switch (j) {
                case 0:
                  return "a";
                case 1:
                  return "b";
                case 2:
                  return "c";
                case 3:
                  return "d";
                case 4:
                  return "e";
                case 5:
                  return "f";
                case 6:
                  return "g";
                case 7:
                  return "h";
              }
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}
