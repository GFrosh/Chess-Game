import { Board } from "../board/Board";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Rook } from "../pieces/Rook";
import { Bishop } from "../pieces/Bishop";

export class Setup {
    static pawns(board: Board) {
        for (let col = 0; col < board.size; col++) {
            // White pawns
            board.placePiece(
                new Pawn("white", { row: 6, col: col })
            );
            // Black pawns
            board.placePiece(
                new Pawn("black", { row: 1, col: col })
            );
        }
    }


    static knights(board: Board) {
        // White Knights
        board.placePiece(
            new Knight("white", { row: 7, col: 1 })
        );
        board.placePiece(
            new Knight("white", { row: 7, col: 6 })
        );
        // Black Knights
        board.placePiece(
            new Knight("black", { row: 0, col: 1 })
        );
        board.placePiece(
            new Knight("black", { row: 0, col: 6 })
        );
    }

    static rooks(board: Board) {
        // WHITE ROOKS
        board.placePiece(
            new Rook("white", { row: 7, col: 0})
        );
        board.placePiece(
            new Rook("white", { row: 7, col: 7 })
        );

        // BLACK ROOKS
        board.placePiece(
            new Rook("black", { row: 0, col: 0 })
        );
        board.placePiece(
            new Rook("black", { row: 0, col: 7 })
        );
    }

    static bishops(board: Board) {
        // WHITE BISHOPS
        board.placePiece(
            new Bishop("white", { row: 7, col: 2 })
        );
        board.placePiece(
            new Bishop("white", { row: 7, col: 5 })
        );

        // BLACK BISHOPS
        board.placePiece(
            new Bishop("black", { row: 0, col: 2 })
        );
        board.placePiece(
            new Bishop("black", { row: 0, col: 5 })
        );
    }
}
