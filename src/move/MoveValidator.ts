import { Board } from "../board/Board";
import { Piece, Color } from "../pieces/Piece";
import { Move } from "./Move";
import { findPosition } from "../utils/positionUtils";
import { positionToAlgebraic } from "../utils/square";

export class MoveValidator {
	private static formatPosition(board: Board, position: Move["from"]): string {
		if (board.isWithinBounds(position)) {
			return positionToAlgebraic(position);
		}

		return `(${position.row},${position.col})`;
	}
	
	// Validate that a piece exists at the source square
	static validateSourcePiece(board: Board, move: Move): Piece {
		const piece = board.getPiece(move.from);
		if (!piece) {
			const fromLabel = this.formatPosition(board, move.from);
			throw new Error(`No piece at source square ${fromLabel}`);
		}
		return piece;
	}

	
	// Validate that it's the player's turn
	static validateTurn(piece: Piece, currentPlayer: Color): void {
		if (piece.color !== currentPlayer) {
			throw new Error("Not your turn");
		}
	}

	
	// Check if the move is legal for the piece
	static isMoveLegal(piece: Piece, board: Board, move: Move): boolean {
		const legalMoves = piece.getLegalMoves(board);
		return findPosition(legalMoves, move.to) !== undefined;
	}

	// Perform all validations and throw on failure
	static validateMove(board: Board, move: Move, currentPlayer: Color): Piece {
		const fromLabel = this.formatPosition(board, move.from);
		const toLabel = this.formatPosition(board, move.to);
		const piece = this.validateSourcePiece(board, move);
		this.validateTurn(piece, currentPlayer);

		if (!this.isMoveLegal(piece, board, move)) {
			throw new Error(`Illegal move: ${piece.type} ${fromLabel} -> ${toLabel}`);
		}

		return piece;
	}
}
