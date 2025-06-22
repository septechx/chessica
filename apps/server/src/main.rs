use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::State,
    response::IntoResponse,
    routing::get,
    Router,
};
use chessica_protocol::types::*;
use futures_util::{SinkExt, StreamExt};
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use uuid::Uuid;

type ClientId = String;

#[derive(Debug)]
struct Client {
    id: ClientId,
    color: Option<Color>,
    sender: mpsc::UnboundedSender<Message>,
}

#[derive(Debug)]
struct GameRoom {
    clients: Vec<Client>,
    game_state: Option<GameState>,
    game_started: bool,
}

impl GameRoom {
    fn new() -> Self {
        Self {
            clients: Vec::new(),
            game_state: None,
            game_started: false,
        }
    }

    fn add_client(&mut self, client: Client) -> Color {
        let color = if self.clients.is_empty() {
            Color::White
        } else {
            Color::Black
        };

        // Create a new client with the assigned color
        let mut client_with_color = client;
        client_with_color.color = Some(color);

        self.clients.push(client_with_color);
        color
    }

    fn remove_client(&mut self, client_id: &ClientId) {
        self.clients.retain(|c| c.id != *client_id);
        if self.clients.len() < 2 {
            self.game_started = false;
            self.game_state = None;
        }
    }

    fn can_start_game(&self) -> bool {
        self.clients.len() == 2 && !self.game_started
    }

    fn start_game(&mut self) {
        if self.can_start_game() {
            self.game_state = Some(GameState {
                board: create_initial_board(),
                turn: Color::White,
                move_history: vec![],
            });
            self.game_started = true;
        }
    }

    fn broadcast(&self, message: &ServerMessage) {
        let json = serde_json::to_string(message).unwrap();
        let ws_message = Message::Text(json.into());

        for client in &self.clients {
            if let Err(e) = client.sender.send(ws_message.clone()) {
                eprintln!("Failed to send message to client {}: {}", client.id, e);
            }
        }
    }

    fn send_to_client(&self, client_id: &ClientId, message: &ServerMessage) -> bool {
        let json = serde_json::to_string(message).unwrap();
        let ws_message = Message::Text(json.into());

        if let Some(client) = self.clients.iter().find(|c| c.id == *client_id) {
            if let Err(e) = client.sender.send(ws_message) {
                eprintln!("Failed to send message to client {}: {}", client.id, e);
                return false;
            }
            true
        } else {
            false
        }
    }

    fn get_client_count(&self) -> u8 {
        self.clients.len() as u8
    }

    fn is_game_started(&self) -> bool {
        self.game_started
    }

    fn get_game_state(&self) -> Option<GameState> {
        self.game_state.clone()
    }

    fn handle_move(&mut self, client_id: &ClientId, move_: &Move) -> Option<(Move, GameState)> {
        // Check if game is started and it's the client's turn
        if let Some(ref mut game_state) = self.game_state {
            if let Some(client) = self.clients.iter().find(|c| c.id == *client_id) {
                if let Some(client_color) = client.color {
                    if game_state.turn == client_color {
                        // TODO: validate move via chess lib
                        game_state.board[move_.to as usize] =
                            game_state.board[move_.from as usize].take();
                        game_state.turn = match game_state.turn {
                            Color::White => Color::Black,
                            Color::Black => Color::White,
                        };
                        game_state.move_history.push(move_.clone());
                        Some((move_.clone(), game_state.clone()))
                    } else {
                        None
                    }
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    }
}

type SharedGameRoom = Arc<Mutex<GameRoom>>;

fn start_game_if_possible(game_room: &SharedGameRoom) {
    let should_start = {
        let mut room = game_room.lock().unwrap();
        if room.can_start_game() {
            room.start_game();
            true
        } else {
            false
        }
    };

    if should_start {
        let room = game_room.lock().unwrap();
        let game_started_msg = ServerMessage::GameStarted;
        room.broadcast(&game_started_msg);

        if let Some(state) = room.get_game_state() {
            let game_state_msg = ServerMessage::GameState { state };
            room.broadcast(&game_state_msg);
        }
    }
}

fn handle_move(game_room: &SharedGameRoom, client_id: &ClientId, move_: &Move) {
    let move_result = {
        let mut room = game_room.lock().unwrap();
        room.handle_move(client_id, move_)
    };

    if let Some((move_, game_state)) = move_result {
        let room = game_room.lock().unwrap();
        let move_msg = ServerMessage::MoveMade { move_ };
        room.broadcast(&move_msg);

        let state_msg = ServerMessage::GameState { state: game_state };
        room.broadcast(&state_msg);
    }
}

fn create_initial_board() -> Vec<Option<Piece>> {
    let mut board = vec![None; 64];

    // Helper function to set a piece at a given position
    let set_piece = |board: &mut Vec<Option<Piece>>, rank: u8, file: u8, piece: Piece| {
        let index = (rank * 8 + file) as usize;
        board[index] = Some(piece);
    };

    // Place white pieces (bottom rank)
    set_piece(
        &mut board,
        6,
        0,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        1,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        2,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        3,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        4,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        5,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        6,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        6,
        7,
        Piece {
            color: Color::White,
            piece: PieceType::Pawn,
        },
    );

    set_piece(
        &mut board,
        7,
        0,
        Piece {
            color: Color::White,
            piece: PieceType::Rook,
        },
    );
    set_piece(
        &mut board,
        7,
        1,
        Piece {
            color: Color::White,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        7,
        2,
        Piece {
            color: Color::White,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        7,
        3,
        Piece {
            color: Color::White,
            piece: PieceType::Queen,
        },
    );
    set_piece(
        &mut board,
        7,
        4,
        Piece {
            color: Color::White,
            piece: PieceType::King,
        },
    );
    set_piece(
        &mut board,
        7,
        5,
        Piece {
            color: Color::White,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        7,
        6,
        Piece {
            color: Color::White,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        7,
        7,
        Piece {
            color: Color::White,
            piece: PieceType::Rook,
        },
    );

    // Place black pieces (top rank)
    set_piece(
        &mut board,
        1,
        0,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        1,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        2,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        3,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        4,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        5,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        6,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );
    set_piece(
        &mut board,
        1,
        7,
        Piece {
            color: Color::Black,
            piece: PieceType::Pawn,
        },
    );

    set_piece(
        &mut board,
        0,
        0,
        Piece {
            color: Color::Black,
            piece: PieceType::Rook,
        },
    );
    set_piece(
        &mut board,
        0,
        1,
        Piece {
            color: Color::Black,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        0,
        2,
        Piece {
            color: Color::Black,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        0,
        3,
        Piece {
            color: Color::Black,
            piece: PieceType::Queen,
        },
    );
    set_piece(
        &mut board,
        0,
        4,
        Piece {
            color: Color::Black,
            piece: PieceType::King,
        },
    );
    set_piece(
        &mut board,
        0,
        5,
        Piece {
            color: Color::Black,
            piece: PieceType::Bishop,
        },
    );
    set_piece(
        &mut board,
        0,
        6,
        Piece {
            color: Color::Black,
            piece: PieceType::Knight,
        },
    );
    set_piece(
        &mut board,
        0,
        7,
        Piece {
            color: Color::Black,
            piece: PieceType::Rook,
        },
    );

    board
}

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(game_room): State<SharedGameRoom>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, game_room))
}

async fn handle_socket(socket: WebSocket, game_room: SharedGameRoom) {
    let (mut sender, mut receiver) = socket.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    let client_id = Uuid::new_v4().to_string();

    // Spawn task to forward messages from channel to websocket
    let mut send_task = tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            if sender.send(message).await.is_err() {
                break;
            }
        }
    });

    // Add client to game room and get assigned color
    let assigned_color = {
        let mut room = game_room.lock().unwrap();
        let client = Client {
            id: client_id.clone(),
            color: None,
            sender: tx,
        };
        room.add_client(client)
    };

    // Send color assignment to the client
    {
        let room = game_room.lock().unwrap();
        let color_msg = ServerMessage::ColorAssigned {
            color: assigned_color,
        };
        room.send_to_client(&client_id, &color_msg);
    }

    // Send waiting status to all clients
    {
        let room = game_room.lock().unwrap();
        let waiting_msg = ServerMessage::WaitingForPlayers {
            connected_count: room.get_client_count(),
        };
        room.broadcast(&waiting_msg);
    }

    // Check if we can start the game and start it if possible
    start_game_if_possible(&game_room);

    // Handle incoming messages
    while let Some(msg_result) = receiver.next().await {
        let msg = match msg_result {
            Ok(Message::Text(txt)) => txt,
            _ => continue,
        };

        match serde_json::from_str::<ClientMessage>(&msg) {
            Ok(ClientMessage::MakeMove { move_ }) => {
                handle_move(&game_room, &client_id, &move_);
            }
            Ok(ClientMessage::JoinGame { .. }) => {
                // Client is already joined, no action needed
            }
            Ok(ClientMessage::Resign) => {
                let err = ServerMessage::Error {
                    message: "Resign not implemented".into(),
                };
                let mut room = game_room.lock().unwrap();
                room.send_to_client(&client_id, &err);
            }
            Err(e) => {
                let err = ServerMessage::Error {
                    message: format!("Invalid message: {}", e),
                };
                let mut room = game_room.lock().unwrap();
                room.send_to_client(&client_id, &err);
            }
        }
    }

    // Clean up when client disconnects
    {
        let mut room = game_room.lock().unwrap();
        room.remove_client(&client_id);

        // Notify remaining clients about the disconnection
        let waiting_msg = ServerMessage::WaitingForPlayers {
            connected_count: room.get_client_count(),
        };
        room.broadcast(&waiting_msg);
    }

    send_task.abort();
}

#[tokio::main]
async fn main() {
    let game_room = Arc::new(Mutex::new(GameRoom::new()));

    let app = Router::new()
        .route("/ws", get(ws_handler))
        .with_state(game_room);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Chess server running on ws://localhost:3000/ws");
    axum::serve(listener, app).await.unwrap();
}
