use crate::state::GameRoom;
use chessica_protocol::types::*;
use std::collections::HashMap;
use std::sync::Mutex;
use uuid::Uuid;

pub fn start_game_if_possible(game_room: &Uuid, game_rooms: &Mutex<HashMap<Uuid, GameRoom>>) {
    let should_start = {
        let mut rooms = game_rooms.lock().unwrap();
        let room = rooms.get_mut(game_room).unwrap();
        if room.can_start_game() {
            room.start_game();
            true
        } else {
            false
        }
    };

    if should_start {
        let mut rooms = game_rooms.lock().unwrap();
        let room = rooms.get_mut(game_room).unwrap();
        let game_started_msg = ServerMessage::GameStarted;
        room.broadcast(&game_started_msg);

        if let Some(state) = room.get_game_state() {
            let game_state_msg = ServerMessage::GameState { state };
            room.broadcast(&game_state_msg);
        }
    }
}

pub fn handle_move(
    game_room: &Uuid,
    game_rooms: &Mutex<HashMap<Uuid, GameRoom>>,
    client_id: &Uuid,
    move_: &Move,
) {
    let move_result = {
        let mut rooms = game_rooms.lock().unwrap();
        let room = rooms.get_mut(game_room).unwrap();
        room.handle_move(client_id, move_)
    };

    if let Some((move_, game_state)) = move_result {
        let mut rooms = game_rooms.lock().unwrap();
        let room = rooms.get_mut(game_room).unwrap();
        let move_msg = ServerMessage::MoveMade { move_ };
        room.broadcast(&move_msg);

        let state_msg = ServerMessage::GameState { state: game_state };
        room.broadcast(&state_msg);
    }
}
