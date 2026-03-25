# Learn: GFrosh/Chess-Engine

This guide is for *learning the codebase* (not just running it). It explains the project goals, the mental model, and where to look when you want to add features.

## What this project is

A lightweight chess engine written in **TypeScript**. The current scope is intentionally small: **board state**, **turn flow**, and a **move pipeline** that’s split into:

- **Validation** (is a move legal?)
- **Execution** (apply the move to the board state)

Right now, **pawns** are the only fully modeled piece, but the structure is designed to scale to the rest of the pieces.

## Quick start (so you can explore)

### Prereqs
- Node.js **18+**
- npm

### Install
```bash
npm install
```

### Run the demo entrypoint
```bash
npm run dev
```

### Run tests
```bash
npm test
```

> Tip: use `npm run test:watch` when iterating.

## Repo map (what lives where)

```text
src/
  index.ts                # example entrypoint / demo usage
  board/
    Board.ts              # 8x8 grid storage + safe access helpers
  game/
    Game.ts               # orchestration: turns + move history
  move/
    Move.ts               # move model (from/to etc.)
    MoveValidator.ts      # "is this move legal?"
    MoveService.ts        # "apply/undo this move"
  pieces/
    Piece.ts              # base class / interface for pieces
    Pawn.ts               # pawn movement rules
    MovementPatterns.ts   # reusable movement helpers (for future pieces)
  utils/
    positionUtils.ts      # position comparisons + scan helpers
    square.ts             # algebraic notation parsing/formatting
  types/
    grid.ts
    pieceType.ts

tests/
  pieces/                 # piece-specific tests
  utils/                  # utility tests
```

## The core mental model

Think of the engine as a layered system:

1. **Board**: owns the grid and safe square access
2. **Pieces**: know how they *could* move (generate candidate/legal moves)
3. **MoveValidator**: enforces game rules at the “can you do this now?” level
4. **MoveService**: mutates state (move/undo) in an atomic way
5. **Game**: orchestrates turns and tracks move history

This separation is important:
- If a rule is about **legality** → it likely belongs in `MoveValidator` (or the piece move generation).
- If a rule is about **changing state** → it belongs in `MoveService`.
- If it’s about **flow** (whose turn, logging history, calling validator/service) → it belongs in `Game`.

## Walkthrough: what happens when you call `game.move("e2","e4")`

At a high level:

1. **Algebraic parsing**
   - `"e2"` / `"e4"` are converted to internal positions via helpers in `src/utils/square.ts`.

2. **Validation**
   - `MoveValidator` checks things like:
     - does a piece exist on the source square?
     - is it the correct player’s turn?
     - is the destination square allowed for that piece?

3. **Execution**
   - `MoveService` updates board state (moving the piece, updating any needed piece/board state).
   - The service is intended to be the single place where “write” operations occur.

4. **Game updates**
   - `Game` advances turn and appends to move history (logged as `from->to` format currently).

If you’re adding a feature, ask: “Which layer should own this responsibility?”

## Learning exercises (good first tasks)

### 1) Add the knight piece (recommended)
Goal: implement `Knight` movement and plug it into the engine.

Suggested steps:
1. Create `src/pieces/Knight.ts`
2. Use or extend `MovementPatterns` (or add a knight-specific helper)
3. Ensure move generation respects:
   - board bounds
   - friendly piece blocking (if applicable in your model)
4. Add tests under `tests/pieces/`

### 2) Add basic check detection (later)
This is more cross-cutting:
- You’ll likely need board scanning + “attacked squares” evaluation.
- Validation rule: “a move is illegal if it leaves your king in check”.

### 3) Promotion (pawn-only enhancement)
Implement:
- detection when a pawn reaches last rank
- execution of the promotion in `MoveService`
- optional choice of promoted piece (start with queen-only if you want)

## Where to add future rules (rule placement cheatsheet)

- **En passant**:
  - needs move history state (or last move) → `Game` or a shared state object
  - legality checks → `MoveValidator`
  - capture execution → `MoveService`

- **Castling**:
  - legality checks (clear squares, rook/king unmoved, not in check, etc.) → `MoveValidator`
  - moving two pieces atomically → `MoveService`

- **Check / checkmate**:
  - check evaluation (king attacked) → likely a utility/service used by `MoveValidator`
  - checkmate is “no legal moves exist” → higher-level logic (often above per-move validation)

## Testing strategy (how to think about tests here)

- Prefer **small unit tests**:
  - `Board` boundaries and placement/retrieval
  - piece move generation (especially pawns today)
  - validator edge cases (wrong turn, illegal destination, etc.)
- Add **integration-ish tests**:
  - a short `Game` sequence that asserts:
    - history entries
    - turn progression
    - board state after multiple moves

Run:
```bash
npm test
```

## Common pitfalls / gotchas

- Be consistent about **coordinate systems**:
  - algebraic notation (`e2`) vs internal row/col indexing.
  - Always use the helpers in `square.ts` instead of hand-rolling conversions.

- Keep responsibilities separated:
  - don’t mutate board state in the validator
  - don’t embed “whose turn is it” inside pieces

## Useful entrypoints when reading code

- Start at `src/index.ts` to see intended usage.
- Then read `src/game/Game.ts` (flow).
- Then `src/move/MoveValidator.ts` and `src/move/MoveService.ts` (engine core).
- Then `src/pieces/Pawn.ts` and `src/pieces/Piece.ts` (piece API and pattern).

## Next documentation to add (optional)

If you want to keep docs evolving, consider adding:
- `docs/rules.md` (engine rule decisions, e.g., what’s implemented and what isn’t)
- `docs/coordinate-system.md` (explicit mapping of algebraic �� internal coordinates)
- `docs/design.md` (why validation/execution are separated)

---
If you tell me whether you want this as *just a generated file* (what I did here) or you want me to **commit it into the repo** on a branch, I can prepare the exact `githubwrite` steps.
