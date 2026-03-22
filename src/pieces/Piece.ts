import { Board } from "../board/Board";
import { PieceType } from "../types/pieceType";

export type Color = "white" | "black";
export type Position = {
	row: number;
	col: number;
}
export class Piece {
	type: PieceType;
	color: Color;
	position: Position;
	isCaptured: boolean = false;

	constructor(type: PieceType, color: Color, position: Position) {
		this.type = type;
		this.color = color;
		this.position = position;
	}

	moveTo(position: Position) {
		this.position = position;
	}

	getLegalMoves(_board: Board): Position[] {
    	return [];
  	}
}
