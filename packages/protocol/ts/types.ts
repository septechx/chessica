export type PieceType =
  | "Rook"
  | "Knight"
  | "Bishop"
  | "King"
  | "Queen"
  | "Pawn";
export type Color = "White" | "Black";

export interface Piece {
  color: Color;
  piece: PieceType;
}

export type Square = number;

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
}

export interface GameState {
  board: (Piece | null)[];
  turn: Color;
  moveHistory: Move[];
  takenPieces: {
    white: Piece[];
    black: Piece[];
  };
}

export type ClientMessage =
  | { type: "Identify"; id: string }
  | { type: "MakeMove"; move_: Move }
  | { type: "JoinGame"; game_id: string }
  | { type: "Resign" }
  | { type: "TakePiece"; from: number; to: number };

export type ServerMessage =
  | { type: "GameState"; state: GameState }
  | { type: "MoveMade"; move_: Move }
  | { type: "Error"; message: string }
  | { type: "ColorAssigned"; color: Color }
  | { type: "GameStarted" }
  //  | { type: "PiceTaken" } // MoveMade should overwrite it, and the data should be in GameState
  | { type: "WaitingForPlayers"; connected_count: number };

export interface NewGameBody {
  color: Color;
}

export interface NewGameResponse {
  gameId: string;
}
