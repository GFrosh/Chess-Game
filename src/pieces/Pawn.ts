import { Piece, Position, Color } from "./Piece";
import { Board } from "../board/Board";

export type PromotionPieceType = "queen" | "rook" | "bishop" | "knight";

export type PawnMove = {
    to: Position;
    isCapture: boolean;
    promotionChoices: PromotionPieceType[];
};

class PromotedPiece extends Piece {
    constructor(type: PromotionPieceType, color: Color, position: Position) {
        super(type, color, position);
    }

    getLegalMoves(board: Board): Position[] {
        if (this.type === "knight") {
            return this.getKnightMoves(board);
        }

        if (this.type === "bishop") {
            return this.getRayMoves(board, [
                { rowDelta: -1, colDelta: -1 },
                { rowDelta: -1, colDelta: 1 },
                { rowDelta: 1, colDelta: -1 },
                { rowDelta: 1, colDelta: 1 }
            ]);
        }

        if (this.type === "rook") {
            return this.getRayMoves(board, [
                { rowDelta: -1, colDelta: 0 },
                { rowDelta: 1, colDelta: 0 },
                { rowDelta: 0, colDelta: -1 },
                { rowDelta: 0, colDelta: 1 }
            ]);
        }

        return this.getRayMoves(board, [
            { rowDelta: -1, colDelta: -1 },
            { rowDelta: -1, colDelta: 1 },
            { rowDelta: 1, colDelta: -1 },
            { rowDelta: 1, colDelta: 1 },
            { rowDelta: -1, colDelta: 0 },
            { rowDelta: 1, colDelta: 0 },
            { rowDelta: 0, colDelta: -1 },
            { rowDelta: 0, colDelta: 1 }
        ]);
    }

    private getRayMoves(
        board: Board,
        directions: { rowDelta: number; colDelta: number }[]
    ): Position[] {
        const moves: Position[] = [];

        for (const direction of directions) {
            let row = this.position.row + direction.rowDelta;
            let col = this.position.col + direction.colDelta;

            while (board.isWithinBounds({ row, col })) {
                const target = { row, col };
                const piece = board.getPiece(target);

                if (!piece) {
                    moves.push(target);
                    row += direction.rowDelta;
                    col += direction.colDelta;
                    continue;
                }

                if (piece.color !== this.color) {
                    moves.push(target);
                }

                break;
            }
        }

        return moves;
    }

    private getKnightMoves(board: Board): Position[] {
        const moves: Position[] = [];

        const jumps = [
            { rowDelta: -2, colDelta: -1 },
            { rowDelta: -2, colDelta: 1 },
            { rowDelta: -1, colDelta: -2 },
            { rowDelta: -1, colDelta: 2 },
            { rowDelta: 1, colDelta: -2 },
            { rowDelta: 1, colDelta: 2 },
            { rowDelta: 2, colDelta: -1 },
            { rowDelta: 2, colDelta: 1 }
        ];

        for (const jump of jumps) {
            const target = {
                row: this.position.row + jump.rowDelta,
                col: this.position.col + jump.colDelta
            };

            if (!board.isWithinBounds(target)) {
                continue;
            }

            const piece = board.getPiece(target);

            if (!piece || piece.color !== this.color) {
                moves.push(target);
            }
        }

        return moves;
    }
}

export class Pawn extends Piece {
    constructor(color: Color, position: Position) {
        super("pawn", color, position);
    }

    getLegalMoves(board: Board): Position[] {
        return this.getLegalMoveDetails(board).map((move) => move.to);
    }

    getLegalMoveDetails(board: Board): PawnMove[] {
        const moves: PawnMove[] = [];

        moves.push(...this.getForwardMoves(board));
        moves.push(...this.getCaptureMoves(board));

        return moves;
    }

    canPromote(position: Position = this.position): boolean {
        return position.row === this.getPromotionRow();
    }

    promote(to: PromotionPieceType): Piece {
        if (!this.canPromote()) {
            throw new Error("Pawn is not on promotion rank");
        }

        return new PromotedPiece(to, this.color, { ...this.position });
    }

    private getForwardMoves(board: Board): PawnMove[] {
        const moves: PawnMove[] = [];
        const direction = this.getDirection();
        const oneStep: Position = {
            row: this.position.row + direction,
            col: this.position.col
        };

        if (!board.isWithinBounds(oneStep) || board.getPiece(oneStep)) {
            return moves;
        }

        moves.push(this.createMove(oneStep, false));

        const twoStep: Position = {
            row: this.position.row + 2 * direction,
            col: this.position.col
        };

        if (
            this.position.row === this.getStartingRow() &&
            board.isWithinBounds(twoStep) &&
            !board.getPiece(twoStep)
        ) {
            moves.push(this.createMove(twoStep, false));
        }

        return moves;
    }

    private getCaptureMoves(board: Board): PawnMove[] {
        const moves: PawnMove[] = [];
        const direction = this.getDirection();

        const candidates: Position[] = [
            { row: this.position.row + direction, col: this.position.col - 1 },
            { row: this.position.row + direction, col: this.position.col + 1 }
        ];

        for (const target of candidates) {
            if (!board.isWithinBounds(target)) {
                continue;
            }

            const targetPiece = board.getPiece(target);

            if (targetPiece && targetPiece.color !== this.color) {
                moves.push(this.createMove(target, true));
            }
        }

        return moves;
    }

    private createMove(to: Position, isCapture: boolean): PawnMove {
        return {
            to,
            isCapture,
            promotionChoices: this.canPromote(to)
                ? ["queen", "rook", "bishop", "knight"]
                : []
        };
    }

    private getDirection(): number {
        return this.color === "white" ? -1 : 1;
    }

    private getStartingRow(): number {
        return this.color === "white" ? 6 : 1;
    }

    private getPromotionRow(): number {
        return this.color === "white" ? 0 : 7;
    }
}
