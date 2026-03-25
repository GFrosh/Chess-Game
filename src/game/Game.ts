import { Board } from "../board/Board";
import { Color } from "../pieces/Piece";
import { algebraicToPosition } from "../utils/square";
import { Move } from "../move/Move";
import { MoveValidator } from "../move/MoveValidator";
import { MoveService } from "../move/MoveService";
import { Setup } from "./Setup";
import { PromotionPieceType } from "../types/pieceType";

export class Game {
	board: Board;
	currentPlayer: Color;
	moveHistory: string[];
	lastMove?: Move;
	inCheck: Color | null;
	isGameOver: boolean;
	winner: Color | null;
	gameEndReason: "checkmate" | "stalemate" | null;

	constructor() {
		this.board = new Board();
		this.currentPlayer = "white";
		this.moveHistory = [];
		this.lastMove = undefined;
		this.inCheck = null;
		this.isGameOver = false;
		this.winner = null;
		this.gameEndReason = null;
	}

	start() {
		this.setupPieces();
	}

	private setupPieces() {
		Setup.standard(this.board);
	}

	move(fromSquare: string, toSquare: string, promotionPiece?: PromotionPieceType) {
		if (this.isGameOver) {
			throw new Error(`Game is over (${this.gameEndReason ?? "unknown"}). Winner: ${this.winner ?? "none"}`);
		}

		const from = algebraicToPosition(fromSquare);
		const to = algebraicToPosition(toSquare);

		const move = new Move(from, to, promotionPiece);

		MoveValidator.validateMove(this.board, move, this.currentPlayer, this.lastMove);
		MoveService.executeMove(this.board, move);
		this.lastMove = move;

		// Log and switch turns
		this.moveHistory.push(`${fromSquare}->${toSquare}`);
		this.switchTurn();

		this.inCheck = MoveValidator.isKingInCheck(this.board, this.currentPlayer)
			? this.currentPlayer
			: null;

		if (MoveValidator.isCheckmate(this.board, this.currentPlayer, this.lastMove)) {
			this.isGameOver = true;
			this.winner = this.currentPlayer === "white" ? "black" : "white";
			this.gameEndReason = "checkmate";
			return;
		}

		if (MoveValidator.isStalemate(this.board, this.currentPlayer, this.lastMove)) {
			this.isGameOver = true;
			this.winner = null;
			this.gameEndReason = "stalemate";
		}
	}

	private switchTurn() {
		this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
	}
}
