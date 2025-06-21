// Chess piece types
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum PieceType {
    Rook,
    Knight,
    Bishop,
    King,
    Queen,
    Pawn,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum Color {
    White,
    Black,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct Piece {
    pub color: Color,
    pub piece: PieceType,
}

pub type Square = u8; // 0-63 for 8x8 board

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct Move {
    pub from: Square,
    pub to: Square,
    pub promotion: Option<PieceType>,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct GameState {
    pub board: Vec<Option<Piece>>,
    pub turn: Color,
    pub move_history: Vec<Move>,
    // Add more fields as needed
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    MakeMove { move_: Move },
    JoinGame { game_id: String },
    Resign,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
pub enum ServerMessage {
    GameState { state: GameState },
    MoveMade { move_: Move },
    Error { message: String },
}
