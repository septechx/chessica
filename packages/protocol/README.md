# Protocol Package

This package provides shared types and structures for the chess websocket protocol, for use in both TypeScript (frontend/backend) and Rust (backend/engine).

## Structure

- `ts/types.ts`: TypeScript types for game state, moves, and websocket messages.
- `rust/types.rs`: Rust structs and enums for the same protocol.

## Usage

- **TypeScript**: Import from `@chessica/protocol` in your frontend or Node.js backend.
- **Rust**: Import from `chessica-protocol` in your Rust backend or engine. Types derive `serde::Serialize` and `serde::Deserialize` for easy (de)serialization.

## Protocol Overview

- `GameState`: Represents the board, turn, and move history.
- `Move`: Represents a chess move (from, to, optional promotion).
- `ClientMessage`/`ServerMessage`: Websocket messages for game actions and state updates.
- `NewGameBody`: Body required to send a PUT request to /api/game to create a new game.
- `NewGameResponse`: Response from sending a PUT request to /api/game to create a new game.
