use crate::create_board::create_initial_board;
use axum::extract::ws::Message;
use chessica_protocol::types::*;
use std::collections::HashMap;
use std::sync::Mutex;
use uuid::Uuid;

pub struct AppState {
    pub game_rooms: Mutex<HashMap<Uuid, GameRoom>>,
    pub client_rooms: Mutex<HashMap<Uuid, Uuid>>,
}

#[derive(Debug)]
pub struct Client {
    pub id: Uuid,
    pub color: Option<Color>,
    pub sender: tokio::sync::mpsc::UnboundedSender<Message>,
}

#[derive(Debug)]
pub struct GameRoom {
    pub clients: Vec<Client>,
    pub game_state: Option<GameState>,
    pub game_started: bool,
    pub game_id: Uuid,
    pub reserved_color: Color,
}

impl GameRoom {
    pub fn new(color: Color) -> Self {
        Self {
            clients: Vec::new(),
            game_state: None,
            game_started: false,
            game_id: Uuid::new_v4(),
            reserved_color: color,
        }
    }

    pub fn add_client(&mut self, client: Client) {
        let color = if self.clients.is_empty() {
            // First client gets the reserved color
            self.reserved_color
        } else if self.clients.len() == 1 {
            // Second client gets the opposite color
            match self.reserved_color {
                Color::White => Color::Black,
                Color::Black => Color::White,
            }
        } else {
            // Room full, do not add more clients
            return;
        };

        let mut client_with_color = client;
        client_with_color.color = Some(color);

        self.clients.push(client_with_color);
    }

    pub fn remove_client(&mut self, client_id: &Uuid) {
        self.clients.retain(|c| c.id != *client_id);
        if self.clients.len() < 2 {
            self.game_started = false;
            self.game_state = None;
        }
    }

    pub fn can_start_game(&self) -> bool {
        self.clients.len() == 2 && !self.game_started
    }

    pub fn start_game(&mut self) {
        if self.can_start_game() {
            self.game_state = Some(GameState {
                board: create_initial_board(),
                turn: Color::White,
                move_history: vec![],
            });
            self.game_started = true;
        }
    }

    pub fn broadcast(&self, message: &ServerMessage) {
        let json = serde_json::to_string(message).unwrap();
        let ws_message = Message::Text(json.clone().into());
        println!(
            "[GameRoom] Broadcasting message: {} to {} clients in game_id={}",
            json,
            self.clients.len(),
            self.game_id
        );
        for client in &self.clients {
            if let Err(e) = client.sender.send(ws_message.clone()) {
                eprintln!("Failed to send message to client {}: {}", client.id, e);
            } else {
                println!("[GameRoom] Sent message to client_id={}", client.id);
            }
        }
    }

    pub fn send_to_client(&self, client_id: &Uuid, message: &ServerMessage) -> bool {
        let json = serde_json::to_string(message).unwrap();
        let ws_message = Message::Text(json.clone().into());
        println!(
            "[GameRoom] Sending message to client_id={}: {}",
            client_id, json
        );
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

    pub fn get_client_count(&self) -> u8 {
        self.clients.len() as u8
    }

    pub fn is_game_started(&self) -> bool {
        self.game_started
    }

    pub fn get_game_state(&self) -> Option<GameState> {
        self.game_state.clone()
    }

    pub fn handle_move(&mut self, client_id: &Uuid, move_: &Move) -> Option<(Move, GameState)> {
        println!(
            "[GameRoom] handle_move called by client_id={:?} with move: from {} to {}",
            client_id, move_.from, move_.to
        );
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
                        println!("[GameRoom] Move applied. Next turn: {:?}", game_state.turn);
                        Some((move_.clone(), game_state.clone()))
                    } else {
                        println!(
                            "[GameRoom] Not this client's turn: client_color={:?} turn={:?}",
                            client_color, game_state.turn
                        );
                        None
                    }
                } else {
                    println!("[GameRoom] Client has no color assigned");
                    None
                }
            } else {
                println!("[GameRoom] Client not found in room");
                None
            }
        } else {
            println!("[GameRoom] No game state");
            None
        }
    }
}
