import { describe, expect, it } from "vitest";
import { Board } from "../../src/board/Board";
import { Pawn } from "../../src/pieces/Pawn";
import { Bishop } from "../../src/pieces/Bishop";
import { Position } from "../../src/pieces/Piece";

function containsPosition(positions: Position[], target: Position): boolean {
	return positions.some((pos) => pos.row === target.row && pos.col === target.col);
}

describe("Bishop legal moves", () => {
	it("returns diagonal rays from the center on an empty board", () => {
		const board = new Board();
		const bishop = new Bishop("white", { row: 4, col: 4 });
		board.placePiece(bishop);

		const moves = bishop.getLegalMoves(board);

		expect(moves).toHaveLength(13);
		expect(containsPosition(moves, { row: 3, col: 3 })).toBe(true);
		expect(containsPosition(moves, { row: 2, col: 2 })).toBe(true);
		expect(containsPosition(moves, { row: 1, col: 1 })).toBe(true);
		expect(containsPosition(moves, { row: 0, col: 0 })).toBe(true);
		expect(containsPosition(moves, { row: 3, col: 5 })).toBe(true);
		expect(containsPosition(moves, { row: 2, col: 6 })).toBe(true);
		expect(containsPosition(moves, { row: 1, col: 7 })).toBe(true);
		expect(containsPosition(moves, { row: 5, col: 5 })).toBe(true);
		expect(containsPosition(moves, { row: 6, col: 6 })).toBe(true);
		expect(containsPosition(moves, { row: 7, col: 7 })).toBe(true);
		expect(containsPosition(moves, { row: 5, col: 3 })).toBe(true);
		expect(containsPosition(moves, { row: 6, col: 2 })).toBe(true);
		expect(containsPosition(moves, { row: 7, col: 1 })).toBe(true);
	});

	it("stops before ally and can capture enemy on a different diagonal", () => {
		const board = new Board();
		const bishop = new Bishop("white", { row: 4, col: 4 });
		const ally = new Pawn("white", { row: 6, col: 6 });
		const enemy = new Pawn("black", { row: 2, col: 2 });
		board.placePiece(bishop);
		board.placePiece(ally);
		board.placePiece(enemy);

		const moves = bishop.getLegalMoves(board);

		expect(containsPosition(moves, { row: 5, col: 5 })).toBe(true);
		expect(containsPosition(moves, { row: 6, col: 6 })).toBe(false);
		expect(containsPosition(moves, { row: 7, col: 7 })).toBe(false);
		expect(containsPosition(moves, { row: 2, col: 2 })).toBe(true);
		expect(containsPosition(moves, { row: 1, col: 1 })).toBe(false);
	});
});
