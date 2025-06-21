// Chess piece types
export type PieceType = "rook" | "knight" | "bishop" | "king" | "queen" | "pawn";
export type Color = "white" | "black";

export interface Piece {
    color: Color;
    piece: PieceType;
}

export type Square = number; // 0-63 for 8x8 board

export interface Move {
    from: Square;
    to: Square;
    promotion?: PieceType;
}

export interface GameState {
    board: (Piece | null)[];
    turn: Color;
    moveHistory: Move[];
    // Add more fields as needed
}

// WebSocket protocol messages
export type ClientMessage =
    | { type: "make_move"; move: Move }
    | { type: "join_game"; gameId: string }
    | { type: "resign" };

export type ServerMessage =
    | { type: "game_state"; state: GameState }
    | { type: "move_made"; move: Move }
    | { type: "error"; message: string }; 