import { Board } from "../board/Board";
import { Piece, Color } from "../pieces/Piece";
import { Move } from "./Move";
import { findPosition } from "../utils/positionUtils";
import { positionToAlgebraic } from "../utils/square";
import { MoveService } from "./MoveService";
import { PromotionPieceType } from "../types/pieceType";

export class MoveValidator {
	private static oppositeColor(color: Color): Color {
		return color === "white" ? "black" : "white";
	}

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

	private static validateCastling(board: Board, king: Piece, move: Move): void {
		if (king.type !== "king") {
			throw new Error("Only kings can castle");
		}

		if (king.hasMoved) {
			throw new Error("Castling not allowed: king has already moved");
		}

		if (move.from.row !== move.to.row || Math.abs(move.to.col - move.from.col) !== 2) {
			throw new Error("Invalid castling target square");
		}

		if (this.isKingInCheck(board, king.color)) {
			throw new Error("Castling not allowed while in check");
		}

		const kingSide = move.to.col > move.from.col;
		const rookCol = kingSide ? 7 : 0;
		const rookFrom = { row: move.from.row, col: rookCol };
		const rookTo = { row: move.from.row, col: kingSide ? 5 : 3 };
		const rook = board.getPiece(rookFrom);

		if (!rook || rook.type !== "rook" || rook.color !== king.color) {
			throw new Error("Castling not allowed: rook not found");
		}

		if (rook.hasMoved) {
			throw new Error("Castling not allowed: rook has already moved");
		}

		const betweenCols = kingSide ? [5, 6] : [1, 2, 3];
		for (const col of betweenCols) {
			if (board.getPiece({ row: move.from.row, col })) {
				throw new Error("Castling not allowed: path is blocked");
			}
		}

		const dangerCols = kingSide ? [5, 6] : [3, 2];
		for (const col of dangerCols) {
			if (this.isSquareAttacked(board, { row: move.from.row, col }, this.oppositeColor(king.color))) {
				throw new Error("Castling not allowed through check");
			}
		}

		move.isCastling = true;
		move.rookFrom = rookFrom;
		move.rookTo = rookTo;
	}

	private static validateEnPassant(board: Board, pawn: Piece, move: Move, lastMove?: Move): void {
		if (pawn.type !== "pawn") {
			throw new Error("Only pawns can perform en passant");
		}

		const direction = pawn.color === "white" ? -1 : 1;
		const rowDelta = move.to.row - move.from.row;
		const colDelta = Math.abs(move.to.col - move.from.col);

		if (rowDelta !== direction || colDelta !== 1) {
			throw new Error("Invalid en passant target square");
		}

		if (board.getPiece(move.to)) {
			throw new Error("En passant destination must be empty");
		}

		if (!lastMove || !lastMove.wasDoubleStepPawnMove || lastMove.pieceType !== "pawn") {
			throw new Error("En passant not available");
		}

		if (lastMove.pieceColor === pawn.color) {
			throw new Error("En passant not available against same color");
		}

		if (lastMove.to.row !== move.from.row || lastMove.to.col !== move.to.col) {
			throw new Error("En passant not available on this file");
		}

		const capturedPawn = board.getPiece({ row: move.from.row, col: move.to.col });
		if (!capturedPawn || capturedPawn.type !== "pawn" || capturedPawn.color === pawn.color) {
			throw new Error("En passant target pawn not found");
		}

		move.isEnPassant = true;
		move.enPassantCapturePos = { row: move.from.row, col: move.to.col };
	}

	private static maybeMarkPromotion(piece: Piece, move: Move): void {
		if (piece.type !== "pawn") {
			return;
		}

		const isPromotionRank =
			(piece.color === "white" && move.to.row === 0) ||
			(piece.color === "black" && move.to.row === 7);

		if (!isPromotionRank) {
			return;
		}

		move.isPromotion = true;
		move.promotionPiece = (move.promotionPiece ?? "queen") as PromotionPieceType;
	}

	private static isSquareAttacked(board: Board, target: Move["to"], byColor: Color): boolean {
		for (let row = 0; row < board.size; row++) {
			for (let col = 0; col < board.size; col++) {
				const piece = board.getPiece({ row, col });
				if (!piece || piece.color !== byColor) {
					continue;
				}

				if (piece.type === "pawn") {
					const direction = byColor === "white" ? -1 : 1;
					const attacks = [
						{ row: piece.position.row + direction, col: piece.position.col - 1 },
						{ row: piece.position.row + direction, col: piece.position.col + 1 }
					];
					if (findPosition(attacks, target)) {
						return true;
					}
					continue;
				}

				const legalMoves = piece.getLegalMoves(board);
				if (findPosition(legalMoves, target)) {
					return true;
				}
			}
		}

		return false;
	}

	private static findKingPosition(board: Board, color: Color): Move["from"] | undefined {
		for (let row = 0; row < board.size; row++) {
			for (let col = 0; col < board.size; col++) {
				const piece = board.getPiece({ row, col });
				if (piece?.type === "king" && piece.color === color) {
					return { row, col };
				}
			}
		}

		return undefined;
	}

	static isKingInCheck(board: Board, color: Color): boolean {
		const kingPosition = this.findKingPosition(board, color);
		if (!kingPosition) {
			throw new Error(`King not found for ${color}`);
		}

		return this.isSquareAttacked(board, kingPosition, this.oppositeColor(color));
	}

	private static wouldLeaveKingInCheck(board: Board, move: Move, color: Color): boolean {
		const executionState = MoveService.executeMove(board, move);
		const kingInCheck = this.isKingInCheck(board, color);
		MoveService.undoMove(board, executionState);
		return kingInCheck;
	}

	// Perform all validations and throw on failure
	static validateMove(board: Board, move: Move, currentPlayer: Color, lastMove?: Move): Piece {
		const fromLabel = this.formatPosition(board, move.from);
		const toLabel = this.formatPosition(board, move.to);
		const piece = this.validateSourcePiece(board, move);
		this.validateTurn(piece, currentPlayer);

		move.isCastling = false;
		move.rookFrom = undefined;
		move.rookTo = undefined;
		move.isEnPassant = false;
		move.enPassantCapturePos = undefined;
		move.isPromotion = false;

		const isCastlingAttempt = piece.type === "king" && move.from.row === move.to.row && Math.abs(move.to.col - move.from.col) === 2;
		const isEnPassantAttempt = piece.type === "pawn" &&
			Math.abs(move.to.col - move.from.col) === 1 &&
			board.getPiece(move.to) === null;

		if (isCastlingAttempt) {
			this.validateCastling(board, piece, move);
		} else if (isEnPassantAttempt) {
			this.validateEnPassant(board, piece, move, lastMove);
		} else if (!this.isMoveLegal(piece, board, move)) {
			throw new Error(`Illegal move: ${piece.type} ${fromLabel} -> ${toLabel}`);
		}

		this.maybeMarkPromotion(piece, move);

		if (this.wouldLeaveKingInCheck(board, move, currentPlayer)) {
			throw new Error(`Move leaves king in check: ${piece.type} ${fromLabel} -> ${toLabel}`);
		}

		return piece;
	}

	private static getCandidateTargets(board: Board, piece: Piece): Move["to"][] {
		const targets: Move["to"][] = [...piece.getLegalMoves(board)];

		if (piece.type === "king") {
			targets.push({ row: piece.position.row, col: piece.position.col + 2 });
			targets.push({ row: piece.position.row, col: piece.position.col - 2 });
		}

		if (piece.type === "pawn") {
			const direction = piece.color === "white" ? -1 : 1;
			targets.push({ row: piece.position.row + direction, col: piece.position.col + 1 });
			targets.push({ row: piece.position.row + direction, col: piece.position.col - 1 });
		}

		return targets;
	}

	static hasAnyLegalMove(board: Board, currentPlayer: Color, lastMove?: Move): boolean {
		for (let row = 0; row < board.size; row++) {
			for (let col = 0; col < board.size; col++) {
				const piece = board.getPiece({ row, col });
				if (!piece || piece.color !== currentPlayer) {
					continue;
				}

				const candidates = this.getCandidateTargets(board, piece);
				for (const target of candidates) {
					if (!board.isWithinBounds(target)) {
						continue;
					}

					const promotionPiece = piece.type === "pawn" && (target.row === 0 || target.row === 7)
						? "queen"
						: undefined;
					const move = new Move({ row, col }, { row: target.row, col: target.col }, promotionPiece);

					try {
						this.validateMove(board, move, currentPlayer, lastMove);
						return true;
					} catch {
						// Try next move candidate.
					}
				}
			}
		}

		return false;
	}

	static isCheckmate(board: Board, currentPlayer: Color, lastMove?: Move): boolean {
		return this.isKingInCheck(board, currentPlayer) && !this.hasAnyLegalMove(board, currentPlayer, lastMove);
	}

	static isStalemate(board: Board, currentPlayer: Color, lastMove?: Move): boolean {
		return !this.isKingInCheck(board, currentPlayer) && !this.hasAnyLegalMove(board, currentPlayer, lastMove);
	}
}
