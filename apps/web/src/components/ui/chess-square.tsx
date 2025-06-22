import type { Color } from "@chessica/protocol";
import { fetchPiece, type UIPiece } from "../../lib/board-utils";

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
    assignedColor,
    isLight,
    onClick
}: ChessSquareProps) {
    const squareBg = isLight ? "bg-gray-300" : "bg-gray-400";

    return (
        <div
            className={`w-20 h-20 border-2 flex justify-center items-center ${squareBg} relative`}
        >
            {/* Add rank/file labels for Black player */}
            {assignedColor === "Black" && (
                <>
                    {file === 0 && (
                        <div className="absolute top-1 left-1 text-xs text-gray-600">
                            {8 - rank}
                        </div>
                    )}
                    {rank === 0 && (
                        <div className="absolute bottom-1 right-1 text-xs text-gray-600">
                            {String.fromCharCode(97 + file)}
                        </div>
                    )}
                </>
            )}

            {/* Add rank/file labels for White player */}
            {assignedColor === "White" && (
                <>
                    {file === 7 && (
                        <div className="absolute top-1 right-1 text-xs text-gray-600">
                            {rank + 1}
                        </div>
                    )}
                    {rank === 7 && (
                        <div className="absolute bottom-1 left-1 text-xs text-gray-600">
                            {String.fromCharCode(97 + file)}
                        </div>
                    )}
                </>
            )}

            {piece === null ? (
                <div></div>
            ) : (
                <div onClick={() => onClick(rank, file)}>
                    <img
                        alt={`${piece.color} ${piece.piece}`}
                        src={fetchPiece(piece)}
                        height={piece.color === "dot" ? 32 : 64}
                        width={piece.color === "dot" ? 32 : 64}
                    />
                </div>
            )}
        </div>
    );
} 