import { Board } from "../board/Board";
import { Piece, Color } from "../pieces/Piece";
import { Move } from "./Move";
import { findPosition } from "../utils/positionUtils";

export class MoveValidator {
	
	// Validate that a piece exists at the source square
	static validateSourcePiece(board: Board, move: Move): Piece {
		const piece = board.getPiece(move.from);
		if (!piece) {
			throw new Error("No piece at source square");
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
		const piece = this.validateSourcePiece(board, move);
		this.validateTurn(piece, currentPlayer);

		if (!this.isMoveLegal(piece, board, move)) {
			throw new Error("Illegal move");
		}

		return piece;
	}
}
