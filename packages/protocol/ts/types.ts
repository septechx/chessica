// Chess piece types
export type PieceType = "Rook" | "Knight" | "Bishop" | "King" | "Queen" | "Pawn";
export type Color = "White" | "Black";

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
    | { type: "MakeMove"; move_: Move }
    | { type: "JoinGame"; game_id: string }
    | { type: "Resign" };

export type ServerMessage =
    | { type: "GameState"; state: GameState }
    | { type: "MoveMade"; move_: Move }
    | { type: "Error"; message: string }
    | { type: "ColorAssigned"; color: Color }
    | { type: "GameStarted" }
    | { type: "WaitingForPlayers"; connected_count: number }; 