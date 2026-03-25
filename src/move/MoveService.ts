import { Board } from "../board/Board";
import { Bishop } from "../pieces/Bishop";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Piece, Position } from "../pieces/Piece";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";
import { PromotionPieceType } from "../types/pieceType";
import { Move } from "./Move";

type PieceSnapshot = {
	piece: Piece;
	position: Position;
	isCaptured: boolean;
	hasMoved: boolean;
};

type SquareSnapshot = {
	position: Position;
	content: Piece | null;
};

export type MoveExecutionState = {
	move: Move;
	squaresBefore: SquareSnapshot[];
	piecesBefore: PieceSnapshot[];
};

// Handles the execution of moves on the board and piece state
// Single source of truth for move execution logic
export class MoveService {
	private static clonePosition(position: Position): Position {
		return { row: position.row, col: position.col };
	}

	private static createPromotionPiece(type: PromotionPieceType, color: Piece["color"], position: Position): Piece {
		switch (type) {
			case "rook":
				return new Rook(color, position);
			case "bishop":
				return new Bishop(color, position);
			case "knight":
				return new Knight(color, position);
			case "queen":
			default:
				return new Queen(color, position);
		}
	}

	private static buildExecutionState(board: Board, move: Move): MoveExecutionState {
		const positions: Position[] = [
			this.clonePosition(move.from),
			this.clonePosition(move.to)
		];

		if (move.isCastling && move.rookFrom && move.rookTo) {
			positions.push(this.clonePosition(move.rookFrom));
			positions.push(this.clonePosition(move.rookTo));
		}

		if (move.isEnPassant && move.enPassantCapturePos) {
			positions.push(this.clonePosition(move.enPassantCapturePos));
		}

		const uniqueKeys = new Set<string>();
		const uniquePositions = positions.filter((position) => {
			const key = `${position.row},${position.col}`;
			if (uniqueKeys.has(key)) {
				return false;
			}
			uniqueKeys.add(key);
			return true;
		});

		const squaresBefore: SquareSnapshot[] = uniquePositions.map((position) => ({
			position: this.clonePosition(position),
			content: board.getPiece(position)
		}));

		const pieceSet = new Set<Piece>();
		for (const square of squaresBefore) {
			if (square.content) {
				pieceSet.add(square.content);
			}
		}

		const piecesBefore: PieceSnapshot[] = Array.from(pieceSet).map((piece) => ({
			piece,
			position: this.clonePosition(piece.position),
			isCaptured: piece.isCaptured,
			hasMoved: piece.hasMoved
		}));

		return { move, squaresBefore, piecesBefore };
	}
	
    // Execute a move: update board state AND piece internal state atomically
	static executeMove(board: Board, move: Move): MoveExecutionState {
		const executionState = this.buildExecutionState(board, move);
		
		// CONFIRM PIECE EXISTENCE
        const piece = board.getPiece(move.from);
		if (!piece) {
			throw new Error("Cannot execute move: no piece at source");
		}

		// CHECK IF MOVE IS A CAPTURE MOVE
		const capturePosition = move.isEnPassant && move.enPassantCapturePos
			? move.enPassantCapturePos
			: move.to;
		const captured: Piece | null = board.getPiece(capturePosition);
		if (captured) {
			captured.updateStatus();
			board.setSquare(capturePosition.row, capturePosition.col, null);
		}

		if (move.isCastling && move.rookFrom && move.rookTo) {
			const rook = board.getPiece(move.rookFrom);
			if (!rook) {
				throw new Error("Invalid castling move: rook not found");
			}

			board.setSquare(move.rookTo.row, move.rookTo.col, rook);
			board.setSquare(move.rookFrom.row, move.rookFrom.col, null);
			rook.moveTo(move.rookTo);
		}

		// Update board state
		board.setSquare(move.to.row, move.to.col, piece);
		board.setSquare(move.from.row, move.from.col, null);

		// Update piece state
		piece.moveTo(move.to);

		if (move.isPromotion) {
			const promotedType = move.promotionPiece ?? "queen";
			const promotedPiece = this.createPromotionPiece(promotedType, piece.color, this.clonePosition(move.to));
			promotedPiece.hasMoved = true;
			board.setSquare(move.to.row, move.to.col, promotedPiece);
		}

		move.pieceType = piece.type;
		move.pieceColor = piece.color;
		move.wasDoubleStepPawnMove = piece.type === "pawn" && Math.abs(move.to.row - move.from.row) === 2;

		return executionState;
	}

	// Undo a move: restore board state AND piece internal state atomically
	static undoMove(board: Board, executionState: MoveExecutionState): void {
		for (const square of executionState.squaresBefore) {
			board.setSquare(square.position.row, square.position.col, square.content);
		}

		for (const snapshot of executionState.piecesBefore) {
			snapshot.piece.position = this.clonePosition(snapshot.position);
			snapshot.piece.isCaptured = snapshot.isCaptured;
			snapshot.piece.hasMoved = snapshot.hasMoved;
		}
	}
}
