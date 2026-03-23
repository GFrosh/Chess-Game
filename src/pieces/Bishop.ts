import { Board } from "../board/Board";
import { Piece, Position, Color } from "./Piece";

export class Bishop extends Piece {
    constructor(color: Color, position: Position) {
        super("bishop", color, position);
    }


    getLegalMoves(board: Board): Position[] {
        const moves: Position[] = [];
        const { row, col } = this.position;
        const directions: Position[] = [
            { row: -1, col: -1 },
            { row: -1, col: 1 },
            { row: 1, col: 1 },
            { row: 1, col: -1 }
        ];

        for (const diagonal of directions) {
            let target: Position = {
                row: row + diagonal.row,
                col: col + diagonal.col
            };

            while (board.isWithinBounds(target)) {
                const pieceAtTarget = board.getPiece(target);

                if (!pieceAtTarget) {
                    moves.push({ row: target.row, col: target.col });
                } else {
                    if (pieceAtTarget.color !== this.color) {
                        moves.push({ row: target.row, col: target.col });
                    }
                    break;
                }

                target = {
                    row: target.row + diagonal.row,
                    col: target.col + diagonal.col
                };
            }
        }

        return moves;
    }
}
