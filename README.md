# Chessica

Chessica is a simple web-based chess platform designed for easy game creation and sharing.

## Tech Stack

- **Frontend:** React (TypeScript, Vite)
- **Protocol:** Type-safe communication using shared types (`@chessica/protocol`)
- **Backend:** Axum (Rust)

## Requirements

- `pnpm`
- `rust`

## Building

1. **Install dependencies:**
   ```
   pnpm install
   ```

2. **Run the development server:**
   ```
   pnpm run --filter web dev
   pnpm run --filter server dev
   ```

3. **Open your browser:**  
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

4. **Configure the backend server URL:**  
   Set the `VITE_SERVER_URL` environment variable if your chess server is not running on `http://localhost:3000`.

## Project Structure

- `apps/web/` - Web application source code
- `apps/server/` - Server source code
- `packages/protocol` - Protocol types source code

## License

Frontend and server: AGPL-3.0<br>
Protocol: MIT License

