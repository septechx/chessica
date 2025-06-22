import type { Color } from "@chessica/protocol";
import { ChessSquare } from "./chess-square";
import type { BoardMap, UIPiece } from "@/lib/board-utils";

interface ChessBoardProps {
    board: BoardMap;
    assignedColor: Color | null;
    onSquareClick: (rank: number, file: number) => void;
}

export function ChessBoard({ board, assignedColor, onSquareClick }: ChessBoardProps) {
    return (
        <div className="flex flex-row max-w-160 border-2">
            {Array.from({ length: 8 }, (_, j) => (
                <div className="flex flex-col" key={j}>
                    {Array.from({ length: 8 }, (__, i) => {
                        const isLight = (i + j) % 2 === 0;

                        // Use flipped coordinates for Black player
                        const [rank, file] = assignedColor === "Black"
                            ? [7 - i, 7 - j]
                            : [i, j];
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
                </div>
            ))}
        </div>
    );
} 