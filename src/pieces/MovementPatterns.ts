import { Board } from "../board/Board";
import { Position } from "./Piece";

/**
 * Reusable movement patterns for different piece types
 */
export class MovementPatterns {
	/**
	 * Get all positions a piece can move to in a straight line (rook-like)
	 * Stops at first piece or board edge
	 */
	static getStraightLineMoves(
		board: Board,
		from: Position,
		directions: [number, number][]
	): Position[] {
		const moves: Position[] = [];

		for (const [deltaRow, deltaCol] of directions) {
			let row = from.row + deltaRow;
			let col = from.col + deltaCol;

			while (board.isWithinBounds({ row, col })) {
				const piece = board.getPiece({ row, col });

				if (!piece) {
					moves.push({ row, col });
				} else {
					moves.push({ row, col }); // Can capture
					break;
				}

				row += deltaRow;
				col += deltaCol;
			}
		}

		return moves;
	}

	/**
	 * Get all positions a piece can jump to (knight-like)
	 */
	static getJumpingMoves(
		board: Board,
		from: Position,
		jumps: [number, number][]
	): Position[] {
		const moves: Position[] = [];

		for (const [deltaRow, deltaCol] of jumps) {
			const target = { row: from.row + deltaRow, col: from.col + deltaCol };

			if (board.isWithinBounds(target)) {
				moves.push(target);
			}
		}

		return moves;
	}

	/**
	 * Get all single-step moves in given directions (king-like)
	 */
	static getSingleStepMoves(
		board: Board,
		from: Position,
		directions: [number, number][]
	): Position[] {
		const moves: Position[] = [];

		for (const [deltaRow, deltaCol] of directions) {
			const target = { row: from.row + deltaRow, col: from.col + deltaCol };

			if (board.isWithinBounds(target)) {
				moves.push(target);
			}
		}

		return moves;
	}
}
