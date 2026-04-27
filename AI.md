# AI — Minimax Chess Bot

This document describes the AI bot added to the chess engine. The bot uses the **minimax algorithm with alpha-beta pruning** to select the strongest available move for either side at a configurable search depth.

---

## Overview

The AI lives entirely in `src/ai/` and is composed of two classes:

| File | Class | Responsibility |
|---|---|---|
| `src/ai/Evaluator.ts` | `Evaluator` | Scores a board position as a number from White's perspective |
| `src/ai/AI.ts` | `AI` | Runs the minimax search and returns the best move |

A supporting method was also added to the existing `MoveValidator`:

| File | Method | Responsibility |
|---|---|---|
| `src/move/MoveValidator.ts` | `getAllLegalMoves` | Returns every validated legal `Move` object for a given player |

---

## How It Works

### 1. Move Generation — `MoveValidator.getAllLegalMoves`

Before the AI can search, it needs to know every legal move available to the current player. The new static method `getAllLegalMoves(board, color, lastMove?)` does exactly this.

**Signature**
```ts
static getAllLegalMoves(board: Board, color: Color, lastMove?: Move): Move[]
```

It iterates every square on the board, collects each friendly piece's candidate target squares (via the pre-existing `getCandidateTargets` helper, which already handles castling and en passant candidates), and then tries to validate each candidate through the full `validateMove` pipeline. Only moves that pass all checks are included in the returned array.

This means the result naturally handles all special rules:
- Castling (both king-side and queen-side)
- En passant (requires `lastMove` to be passed through)
- Pawn promotion (auto-selected as `queen`)
- Moves that would leave the king in check are excluded

---

### 2. Board Evaluation — `Evaluator`

The `Evaluator` class provides a single static method:

```ts
static evaluate(board: Board): number
```

The return value is always from **White's perspective**:
- Positive → White is ahead
- Negative → Black is ahead
- Zero → equal position

The score is computed by summing two components for each piece on the board:

#### Material Value

Each piece type is assigned a centipawn value reflecting its relative strength:

| Piece | Value |
|-------|------:|
| Pawn | 100 |
| Knight | 320 |
| Bishop | 330 |
| Rook | 500 |
| Queen | 900 |
| King | 20 000 |

The king's value is intentionally very high so the engine never sacrifices it.

#### Positional Bonus (Piece-Square Tables)

Each piece type also has an 8×8 table of positional bonuses. The bonus for a given piece is looked up from the table using its board square:

- **White** pieces use the table row directly (row 0 = rank 8, row 7 = rank 1).
- **Black** pieces use the **vertically mirrored** row (`7 - row`) so both sides share the same positional incentives relative to their own starting direction.

The tables encode common chess principles:

- **Pawns** are rewarded for advancing toward the opponent's back rank, and penalised for staying on the starting rank.
- **Knights** are rewarded for occupying central squares and penalised for sitting on the edge.
- **Bishops** are rewarded for long diagonals and active central positions.
- **Rooks** are rewarded for reaching the 7th rank (opponent's second rank).
- **Queens** favour active central development without over-exposure.
- **Kings** are strongly penalised for leaving a central pawn shelter (middlegame safety) and slightly rewarded for corner positioning.

---

### 3. Search — `AI` (Minimax + Alpha-Beta Pruning)

The `AI` class encapsulates the search algorithm.

```ts
const ai = new AI(depth); // depth defaults to 3 plies (half-moves)
const best = ai.getBestMove(board, color, lastMove?);
```

#### `getBestMove`

```ts
getBestMove(board: Board, color: Color, lastMove?: Move): BestMove | null
```

Returns a `BestMove` object (containing `from`, `to`, and an optional `promotionPiece`) or `null` if the player has no legal moves (checkmate or stalemate).

Internally it generates all legal moves with `getAllLegalMoves`, tries each one by executing it on the board (using `MoveService.executeMove`), recursing into `minimax`, then undoing it (`MoveService.undoMove`). The move with the best score for the given side is returned.

#### `minimax` (private)

```
minimax(board, depth, alpha, beta, isMaximizing, currentColor, lastMove?)
```

Implements the standard minimax algorithm with alpha-beta pruning:

- **Maximiser** = White (wants the highest score).
- **Minimiser** = Black (wants the lowest score).
- At **depth 0** the position is evaluated statically with `Evaluator.evaluate(board)`.
- When a player has **no legal moves**:
  - If their king is in check → **checkmate** → return `−∞` (maximiser lost) or `+∞` (minimiser lost).
  - Otherwise → **stalemate** → return `0` (draw).
- **Alpha-beta pruning** skips branches that cannot possibly affect the final result:
  - **Beta cut-off**: a maximiser node exceeds the minimiser's current best (`beta ≤ alpha`), so the minimiser would never allow this branch.
  - **Alpha cut-off**: a minimiser node falls below the maximiser's current best, so the maximiser would never choose this branch.

This pruning significantly reduces the number of nodes evaluated compared with a plain minimax search, enabling deeper effective search in the same time.

#### Search Depth

The depth is measured in **plies** (half-moves). A depth of 3 means the AI looks 3 half-moves ahead — White's move, Black's response, White's response — before evaluating the resulting position. Higher depths produce stronger play at the cost of increased computation time.

| Depth | Typical use |
|-------|-------------|
| 1 | Instant, greedy (material only) |
| 2 | Fast, tactical awareness |
| **3** | **Default — good balance of speed and strength** |
| 4+ | Stronger play, noticeable delay for complex positions |

---

## API Reference

### `AI`

```ts
import { AI } from "./src/ai/AI";
import { BestMove } from "./src/ai/AI";

const ai = new AI(3); // depth: number (default 3)

const best: BestMove | null = ai.getBestMove(board, "black", lastMove);
// BestMove = { from: Position, to: Position, promotionPiece?: PromotionPieceType }
```

### `Evaluator`

```ts
import { Evaluator } from "./src/ai/Evaluator";

const score: number = Evaluator.evaluate(board);
// positive  → White is better
// negative  → Black is better
// 0         → equal
```

### `MoveValidator.getAllLegalMoves`

```ts
import { MoveValidator } from "./src/move/MoveValidator";
import { Move } from "./src/move/Move";

const moves: Move[] = MoveValidator.getAllLegalMoves(board, "white", lastMove);
```

---

## Usage Example

The following shows how to integrate the AI into the existing `Game` class to drive the Black side:

```ts
import { Game } from "./src/game/Game";
import { AI } from "./src/ai/AI";
import { positionToAlgebraic } from "./src/utils/square";

const game = new Game();
game.start();

const ai = new AI(3); // Black bot at depth 3

// White makes a manual move
game.move("e2", "e4");

// AI picks the best response for Black
const best = ai.getBestMove(game.board, "black", game.lastMove);
if (best) {
    const from = positionToAlgebraic(best.from);
    const to   = positionToAlgebraic(best.to);
    game.move(from, to, best.promotionPiece);
}

console.log("Move history:", game.moveHistory);
game.board.print();
```

---

## Tests

Tests for all new functionality live in `tests/ai/AI.test.ts` (11 tests):

| Suite | Test | What it verifies |
|-------|------|-----------------|
| `Evaluator` | symmetric kings → score 0 | Piece-square tables cancel for mirrored positions |
| `Evaluator` | White queen → positive score | Material advantage detected correctly |
| `Evaluator` | Black queen → negative score | Material disadvantage detected correctly |
| `MoveValidator.getAllLegalMoves` | starting position → 20 moves | 16 pawn + 4 knight moves at game start |
| `MoveValidator.getAllLegalMoves` | checkmate position → 0 moves | No moves returned when mated |
| `AI` | returns non-null from start | AI always finds a move in a normal position |
| `AI` | returned move executes without error | Move is valid and can be played on the `Game` object |
| `AI` | returns null in checkmate | `getBestMove` returns `null` when no legal moves exist |
| `AI` | mate-in-one (depth 2) | AI selects the mating rook move (Rh6#) |
| `AI` | captures free queen | AI greedily takes an undefended opponent queen |
| `AI` | pawn promotion | AI promotes a pawn to queen on the last rank |

Run them with:

```bash
npm test
```

---

## File Structure After This Change

```text
src/
  ai/
    AI.ts          ← new: minimax search with alpha-beta pruning
    Evaluator.ts   ← new: material + piece-square table evaluation
  move/
    MoveValidator.ts  ← updated: added getAllLegalMoves()
  ...

tests/
  ai/
    AI.test.ts     ← new: 11 tests covering Evaluator, move generation, and AI search
  ...
```
