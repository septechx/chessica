use uuid::Uuid;

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

pub type Square = u8;

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
    pub taken_pieces: TakenPieces,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct TakenPieces {
    white: Vec<Piece>,
    black: Vec<Piece>,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    Identify { id: Uuid },
    MakeMove { move_: Move },
    JoinGame { game_id: Uuid },
    TakePiece { from: Square, to: Square },
    Resign,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(tag = "type")]
pub enum ServerMessage {
    GameState { state: GameState },
    MoveMade { move_: Move },
    Error { message: String },
    ColorAssigned { color: Color },
    GameStarted,
    WaitingForPlayers { connected_count: u8 },
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct NewGameBody {
    pub color: Color,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct NewGameResponse {
    #[serde(rename = "gameId")]
    pub game_id: Uuid,
}
