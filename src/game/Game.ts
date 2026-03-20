import { Board } from "../board/Board";
import { Color, Position } from "../pieces/Piece";
import { Pawn } from "../pieces/Pawn";
import { algebraicToPosition } from "../utils/square";
import { Move } from "../move/Move";
import { MoveValidator } from "../move/MoveValidator";
import { MoveService } from "../move/MoveService";

export class Game {
	board: Board;
	currentPlayer: Color;
	moveHistory: string[];

	constructor() {
		this.board = new Board();
		this.currentPlayer = "white";
		this.moveHistory = [];
	}

	start() {
		this.setupPieces();
	}

	private setupPieces() {
		// Pawns only (for now)

		for (let col = 0; col < this.board.size; col++) {
			// White pawns
			this.board.placePiece(
				new Pawn("white", { row: 6, col: col })
			);

			// Black pawns
			this.board.placePiece(
				new Pawn("black", { row: 1, col: col })
			);
		}
	}

	move(
		fromSquare: string,
		toSquare: string
	) {
		const from = algebraicToPosition(fromSquare);
		const to = algebraicToPosition(toSquare);

		const move = new Move(from, to);

		// Validate the move (source piece, turn, legality)
		MoveValidator.validateMove(this.board, move, this.currentPlayer);

		// Execute the move atomically
		MoveService.executeMove(this.board, move);

		// Log and switch turns
		this.moveHistory.push(`${fromSquare}->${toSquare}`);
		this.switchTurn();
	}

	private switchTurn() {
		this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
	}
}
