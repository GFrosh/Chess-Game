import { Color, Position } from "../pieces/Piece";
import { PieceType, PromotionPieceType } from "../types/pieceType";
export type Moves = Position[];

export class Move {
    from: Position;
    to: Position;
    promotionPiece?: PromotionPieceType;

    isCastling: boolean;
    rookFrom?: Position;
    rookTo?: Position;

    isEnPassant: boolean;
    enPassantCapturePos?: Position;

    isPromotion: boolean;

    pieceType?: PieceType;
    pieceColor?: Color;
    wasDoubleStepPawnMove: boolean;

    constructor(from: Position, to: Position, promotionPiece?: PromotionPieceType) {
        this.from = from;
        this.to = to;
        this.promotionPiece = promotionPiece;

        this.isCastling = false;
        this.isEnPassant = false;
        this.isPromotion = false;
        this.wasDoubleStepPawnMove = false;
    }
}
