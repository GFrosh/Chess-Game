# Chess Engine (TypeScript)

[![CI](https://github.com/GFrosh/Chess-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/GFrosh/Chess-Game/actions/workflows/ci.yml)
[![Languages](https://img.shields.io/github/languages/count/GFrosh/Chess-Engine?label=TypeScript&color=blue)](https://github.com/GFrosh/Chess-Engine)

A lightweight chess engine written in TypeScript with a clear separation between move validation and move execution.

Current implementation supports full piece movement rules for all standard piece types and a standard board setup.

## AI Bot

A minimax-based chess bot with alpha-beta pruning is included. See **[AI.md](AI.md)** for full documentation, including the evaluation function, search algorithm, API reference, and usage examples.

## Current Features

- 8x8 board model with bounds-safe access (`Board`)
- Standard starting position setup (`Setup.standard`)
- Piece movement rules implemented for:
  - pawn
  - rook
  - knight
  - bishop
  - queen
  - king
- Turn-based move validation pipeline (`MoveValidator`)
  - source square contains a piece
  - piece color matches current player
  - destination is in the piece's legal move list
  - move cannot leave own king in check
- Atomic move execution service (`MoveService`)
  - updates board squares
  - updates moved piece position
  - supports basic capture handling
- Full special-move support
  - castling
  - en passant
  - promotion (defaults to queen if omitted)
- Game state checks
  - check detection
  - checkmate detection
  - stalemate detection
  - game end reason (`checkmate` or `stalemate`)
- Algebraic square parsing and formatting (`algebraicToPosition`, `positionToAlgebraic`)
- Move history logging in game flow (`from->to` string format)
- Terminal-friendly ASCII board rendering (`Board.toAscii` / `Board.print`)

## Architecture

- `Game`: orchestrates game flow (start, move, turn switching, history)
- `Setup`: places all pieces on initial squares
- `MoveValidator`: owns legality checks
- `MoveService`: owns state mutation for execute/undo
- `Board`: owns grid storage and square access
- `Piece` subclasses: own movement generation for each piece type
- `AI`: minimax search with alpha-beta pruning (`src/ai/AI.ts`)
- `Evaluator`: static board scoring by material + piece-square tables (`src/ai/Evaluator.ts`)
- `utils`: position and square conversion helpers

## Project Structure

```text
src/
  index.ts
  ai/
    AI.ts
    Evaluator.ts
  board/
    Board.ts
  game/
    Game.ts
    Setup.ts
  move/
    Move.ts
    MoveService.ts
    MoveValidator.ts
  pieces/
    Bishop.ts
    King.ts
    Knight.ts
    Pawn.ts
    Piece.ts
    Queen.ts
    Rook.ts
  types/
    grid.ts
    pieceType.ts
  utils/
    positionUtils.ts
    square.ts

tests/
  ai/
    AI.test.ts
  game/
    SpecialRules.test.ts
  pieces/
    Bishop.test.ts
    Pawn.test.ts
    RookKnight.test.ts
  utils/
    positionUtils.test.ts
    square.test.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Demo

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Watch Tests

```bash
npm run test:watch
```

### Build

```bash
npm run build
```

### Run Built Output

```bash
npm start
```

## Usage Example

From `src/index.ts`:

```ts
import { Game } from "./game/Game";

const game = new Game();

game.start();
game.move("e2", "e4");
game.move("e7", "e5");
game.move("g1", "f3");
game.move("b8", "c6");
game.move("f1", "c4");

console.log("Game History:");
console.log(game.moveHistory);

console.log("Board State:");
game.board.print();
```

## Current Limitations

- No FEN/PGN import-export
- Move history is a simple `from->to` list (not full algebraic notation)

## License

This project is licensed under the ISC License. See `LICENSE` for details.
