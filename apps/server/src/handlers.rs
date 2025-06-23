use crate::game_logic::handle_move;
use crate::state::AppState;
use crate::state::Client;
use crate::state::GameRoom;
use axum::{
    extract::{
        ws::{WebSocket, WebSocketUpgrade},
        Json, State,
    },
    response::IntoResponse,
};
use chessica_protocol::types::*;
use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::mpsc;
use uuid::Uuid;

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(app_state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, app_state.clone()))
}

pub async fn handle_socket(socket: WebSocket, app_state: Arc<AppState>) {
    use axum::extract::ws::Message;
    let (mut sender, mut receiver) = socket.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    let send_task = tokio::spawn(async move {
        while let Some(message) = rx.recv().await {
            if sender.send(message).await.is_err() {
                break;
            }
        }
    });

    let mut client_id: Option<Uuid> = None;
    let mut joined_game_id: Option<Uuid> = None;

    println!("[WS] New client connected");

    while let Some(msg_result) = receiver.next().await {
        let msg = match msg_result {
            Ok(Message::Text(txt)) => txt,
            Ok(Message::Close(_)) | Err(_) => {
                println!(
                    "[WS] Client disconnected: id={:?} game_id={:?}",
                    client_id, joined_game_id
                );
                break;
            }
            _ => continue,
        };

        println!(
            "[WS] Received message from client_id={:?} game_id={:?}: {}",
            client_id, joined_game_id, msg
        );

        let parsed = serde_json::from_str::<ClientMessage>(&msg);
        let mut send_error = |message: String| {
            let err = ServerMessage::Error { message };
            let _ = tx.send(Message::Text(serde_json::to_string(&err).unwrap().into()));
        };

        match parsed {
            Ok(ClientMessage::Identify { id }) => {
                client_id = Some(id);
            }
            Ok(ClientMessage::JoinGame { game_id }) => {
                let id = match client_id {
                    Some(id) => id,
                    None => {
                        send_error("Identify first".into());
                        continue;
                    }
                };
                let mut rooms = app_state.game_rooms.lock().unwrap();
                if let Some(room) = rooms.get_mut(&game_id) {
                    let client = Client {
                        id,
                        color: None,
                        sender: tx.clone(),
                    };
                    room.add_client(client);
                    joined_game_id = Some(game_id);
                    if let Some(assigned) = room
                        .clients
                        .iter()
                        .find(|c| c.id == id)
                        .and_then(|c| c.color)
                    {
                        let _ = tx.send(Message::Text(
                            serde_json::to_string(&ServerMessage::ColorAssigned {
                                color: assigned,
                            })
                            .unwrap()
                            .into(),
                        ));
                    }
                    if room.can_start_game() {
                        room.start_game();
                        room.broadcast(&ServerMessage::GameStarted);
                        if let Some(state) = room.get_game_state() {
                            room.broadcast(&ServerMessage::GameState { state });
                        }
                    } else {
                        room.broadcast(&ServerMessage::WaitingForPlayers {
                            connected_count: room.get_client_count(),
                        });
                    }
                } else {
                    send_error("Game not found".into());
                }
            }
            Ok(ClientMessage::MakeMove { move_ }) => {
                let id = match client_id {
                    Some(id) => id,
                    None => {
                        send_error("Identify first".into());
                        continue;
                    }
                };
                let game_id = match joined_game_id {
                    Some(gid) => gid,
                    None => {
                        send_error("Join a game first".into());
                        continue;
                    }
                };
                let mut rooms = app_state.game_rooms.lock().unwrap();
                if let Some(room) = rooms.get_mut(&game_id) {
                    let move_result = room.handle_move(&id, &move_);
                    if let Some((move_, game_state)) = move_result {
                        room.broadcast(&ServerMessage::MoveMade {
                            move_: move_.clone(),
                        });
                        room.broadcast(&ServerMessage::GameState { state: game_state });
                    } else {
                        send_error("Invalid move or not your turn".into());
                    }
                } else {
                    send_error("Game not found".into());
                }
            }
            Ok(ClientMessage::Resign) => {
                send_error("Resign not implemented".into());
            }
            Err(e) => {
                send_error(format!("Invalid message: {}", e));
            }
        }
    }

    if let (Some(id), Some(game_id)) = (client_id, joined_game_id) {
        let mut rooms = app_state.game_rooms.lock().unwrap();
        if let Some(room) = rooms.get_mut(&game_id) {
            room.remove_client(&id);
            if !room.is_game_started() {
                room.broadcast(&ServerMessage::WaitingForPlayers {
                    connected_count: room.get_client_count(),
                });
            }
        }
    }

    println!(
        "[WS] Client cleanup done: id={:?} game_id={:?}",
        client_id, joined_game_id
    );
    send_task.abort();
}

pub async fn new_game_handler(
    State(app_state): State<Arc<AppState>>,
    Json(payload): Json<NewGameBody>,
) -> impl IntoResponse {
    let mut rooms = app_state.game_rooms.lock().unwrap();
    let game_room = GameRoom::new(payload.color);
    let game_id = game_room.game_id;
    rooms.insert(game_id, game_room);

    let response = NewGameResponse { game_id };

    axum::Json(response)
}
