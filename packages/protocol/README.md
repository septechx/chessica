# Protocol Package

This package provides shared types and structures for the chess websocket protocol, for use in both TypeScript (frontend/backend) and Rust (backend/engine).

## Structure

- `ts/types.ts`: TypeScript types for game state, moves, and websocket messages.
- `rust/types.rs`: Rust structs and enums for the same protocol.

## Usage

- **TypeScript**: Import from `packages/protocol/ts/types.ts` in your frontend or Node.js backend.
- **Rust**: Import from `packages/protocol/rust/types.rs` in your Rust backend or engine. Types derive `serde::Serialize` and `serde::Deserialize` for easy (de)serialization.

## Protocol Overview

- `GameState`: Represents the board, turn, and move history.
- `Move`: Represents a chess move (from, to, optional promotion).
- `ClientMessage`/`ServerMessage`: Websocket messages for game actions and state updates.

Keep these types in sync between TypeScript and Rust to ensure protocol compatibility. 