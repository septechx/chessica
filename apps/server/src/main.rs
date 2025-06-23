mod create_board;
mod game_logic;
mod handlers;
mod state;

use axum::{
    http::Method,
    routing::{get, put},
    Router,
};
use state::AppState;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    let app_state = Arc::new(AppState {
        game_rooms: Mutex::new(std::collections::HashMap::new()),
        client_rooms: Mutex::new(std::collections::HashMap::new()),
    });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::PUT, Method::GET])
        .allow_headers(Any);

    let app = Router::new()
        .route("/ws", get(handlers::ws_handler))
        .route("/api/game", put(handlers::new_game_handler))
        .layer(cors)
        .with_state(app_state);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Chess server running on ws://localhost:3000/ws");
    axum::serve(listener, app).await.unwrap();
}
