import { describe, expect, it } from "vitest";
import { Board } from "../../src/board/Board";
import { Pawn } from "../../src/pieces/Pawn";
import { Position } from "../../src/pieces/Piece";

function containsPosition(positions: Position[], target: Position): boolean {
	return positions.some((pos) => pos.row === target.row && pos.col === target.col);
}

describe("Pawn legal moves", () => {
	it("allows one-step and two-step forward from starting row when clear", () => {
		const board = new Board();
		const pawn = new Pawn("white", { row: 6, col: 4 });
		board.placePiece(pawn);

		const moves = pawn.getLegalMoves(board);

		expect(containsPosition(moves, { row: 5, col: 4 })).toBe(true);
		expect(containsPosition(moves, { row: 4, col: 4 })).toBe(true);
	});

	it("blocks forward moves when piece is directly ahead", () => {
		const board = new Board();
		const whitePawn = new Pawn("white", { row: 6, col: 4 });
		const blocker = new Pawn("black", { row: 5, col: 4 });
		board.placePiece(whitePawn);
		board.placePiece(blocker);

		const moves = whitePawn.getLegalMoves(board);

		expect(containsPosition(moves, { row: 5, col: 4 })).toBe(false);
		expect(containsPosition(moves, { row: 4, col: 4 })).toBe(false);
	});

	it("allows diagonal capture only for enemy pieces", () => {
		const board = new Board();
		const whitePawn = new Pawn("white", { row: 6, col: 4 });
		const enemyLeft = new Pawn("black", { row: 5, col: 3 });
		const allyRight = new Pawn("white", { row: 5, col: 5 });
		board.placePiece(whitePawn);
		board.placePiece(enemyLeft);
		board.placePiece(allyRight);

		const moves = whitePawn.getLegalMoves(board);

		expect(containsPosition(moves, { row: 5, col: 3 })).toBe(true);
		expect(containsPosition(moves, { row: 5, col: 5 })).toBe(false);
	});
});