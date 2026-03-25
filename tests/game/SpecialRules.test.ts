import { describe, expect, it } from "vitest";
import { Board } from "../../src/board/Board";
import { Move } from "../../src/move/Move";
import { MoveService } from "../../src/move/MoveService";
import { MoveValidator } from "../../src/move/MoveValidator";
import { Bishop } from "../../src/pieces/Bishop";
import { King } from "../../src/pieces/King";
import { Pawn } from "../../src/pieces/Pawn";
import { Queen } from "../../src/pieces/Queen";
import { Rook } from "../../src/pieces/Rook";
import { Game } from "../../src/game/Game";

describe("Special move rules", () => {
	it("supports king-side castling when path is clear and safe", () => {
		const board = new Board();
		const whiteKing = new King("white", { row: 7, col: 4 });
		const whiteRook = new Rook("white", { row: 7, col: 7 });
		const blackKing = new King("black", { row: 0, col: 4 });

		board.placePiece(whiteKing);
		board.placePiece(whiteRook);
		board.placePiece(blackKing);

		const move = new Move({ row: 7, col: 4 }, { row: 7, col: 6 });
		MoveValidator.validateMove(board, move, "white");
		MoveService.executeMove(board, move);

		expect(board.getPiece({ row: 7, col: 6 })?.type).toBe("king");
		expect(board.getPiece({ row: 7, col: 5 })?.type).toBe("rook");
		expect(board.getPiece({ row: 7, col: 4 })).toBeNull();
		expect(board.getPiece({ row: 7, col: 7 })).toBeNull();
	});

	it("supports en passant after an adjacent double-step pawn move", () => {
		const board = new Board();
		const whiteKing = new King("white", { row: 7, col: 4 });
		const blackKing = new King("black", { row: 0, col: 4 });
		const whitePawn = new Pawn("white", { row: 3, col: 4 });
		const blackPawn = new Pawn("black", { row: 3, col: 3 });

		board.placePiece(whiteKing);
		board.placePiece(blackKing);
		board.placePiece(whitePawn);
		board.placePiece(blackPawn);

		const lastMove = new Move({ row: 1, col: 3 }, { row: 3, col: 3 });
		lastMove.pieceType = "pawn";
		lastMove.pieceColor = "black";
		lastMove.wasDoubleStepPawnMove = true;

		const move = new Move({ row: 3, col: 4 }, { row: 2, col: 3 });
		MoveValidator.validateMove(board, move, "white", lastMove);
		MoveService.executeMove(board, move);

		expect(board.getPiece({ row: 2, col: 3 })?.type).toBe("pawn");
		expect(board.getPiece({ row: 3, col: 3 })).toBeNull();
	});

	it("promotes pawn to selected piece on last rank", () => {
		const board = new Board();
		const whiteKing = new King("white", { row: 7, col: 4 });
		const blackKing = new King("black", { row: 0, col: 4 });
		const whitePawn = new Pawn("white", { row: 1, col: 0 });

		board.placePiece(whiteKing);
		board.placePiece(blackKing);
		board.placePiece(whitePawn);

		const move = new Move({ row: 1, col: 0 }, { row: 0, col: 0 }, "queen");
		MoveValidator.validateMove(board, move, "white");
		MoveService.executeMove(board, move);

		expect(board.getPiece({ row: 0, col: 0 })?.type).toBe("queen");
		expect(board.getPiece({ row: 0, col: 0 })?.color).toBe("white");
	});
});

describe("Check and checkmate", () => {
	it("rejects a move that leaves the king in check", () => {
		const board = new Board();
		const whiteKing = new King("white", { row: 7, col: 4 });
		const whiteBishop = new Bishop("white", { row: 6, col: 4 });
		const blackRook = new Rook("black", { row: 0, col: 4 });
		const blackKing = new King("black", { row: 0, col: 0 });

		board.placePiece(whiteKing);
		board.placePiece(whiteBishop);
		board.placePiece(blackRook);
		board.placePiece(blackKing);

		const illegalMove = new Move({ row: 6, col: 4 }, { row: 5, col: 5 });
		expect(() => MoveValidator.validateMove(board, illegalMove, "white")).toThrow(
			"Move leaves king in check"
		);
	});

	it("detects simple checkmate positions", () => {
		const board = new Board();
		const blackKing = new King("black", { row: 0, col: 0 });
		const whiteKing = new King("white", { row: 2, col: 2 });
		const whiteQueen = new Queen("white", { row: 1, col: 1 });
		const whiteRook = new Rook("white", { row: 1, col: 0 });

		board.placePiece(blackKing);
		board.placePiece(whiteKing);
		board.placePiece(whiteQueen);
		board.placePiece(whiteRook);

		expect(MoveValidator.isKingInCheck(board, "black")).toBe(true);
		expect(MoveValidator.isCheckmate(board, "black")).toBe(true);
	});

	it("detects simple stalemate positions", () => {
		const board = new Board();
		const blackKing = new King("black", { row: 0, col: 0 });
		const whiteKing = new King("white", { row: 2, col: 2 });
		const whiteQueen = new Queen("white", { row: 1, col: 2 });

		board.placePiece(blackKing);
		board.placePiece(whiteKing);
		board.placePiece(whiteQueen);

		expect(MoveValidator.isKingInCheck(board, "black")).toBe(false);
		expect(MoveValidator.isStalemate(board, "black")).toBe(true);
	});

	it("reports checkmate reason in game flow", () => {
		const game = new Game();
		game.start();

		game.move("f2", "f3");
		game.move("e7", "e5");
		game.move("g2", "g4");
		game.move("d8", "h4");

		expect(game.isGameOver).toBe(true);
		expect(game.gameEndReason).toBe("checkmate");
		expect(game.winner).toBe("black");
		expect(game.inCheck).toBe("white");
	});

	it("reports stalemate reason in game flow", () => {
		const game = new Game();
		game.board = new Board();
		game.currentPlayer = "white";
		game.moveHistory = [];
		game.lastMove = undefined;
		game.isGameOver = false;
		game.winner = null;
		game.inCheck = null;
		game.gameEndReason = null;

		game.board.placePiece(new King("black", { row: 0, col: 0 }));
		game.board.placePiece(new King("white", { row: 2, col: 2 }));
		game.board.placePiece(new Queen("white", { row: 2, col: 1 }));

		game.move("b6", "c7");

		expect(game.currentPlayer).toBe("black");
		expect(game.isGameOver).toBe(true);
		expect(game.gameEndReason).toBe("stalemate");
		expect(game.winner).toBeNull();
		expect(game.inCheck).toBeNull();
	});
});
