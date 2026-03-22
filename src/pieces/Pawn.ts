import { Board } from "../board/Board";
import { Piece, Position, Color } from "./Piece";

export class Pawn extends Piece {
    constructor(color: Color, position: Position) {
		super("pawn", color, position);
	}


	// THIS IS METHOD OVER-"RIDING" 😂 IYKYK
	getLegalMoves(board: Board): Position[] {
		
		// JUST DEFINING MOVES AND DIRECTION FOR EACH INSTANCE
		const moves: Position[] = [];
		const direction: number = this.color === "white" ? -1 : 1;
		const { row, col } = this.position;

		// POSSIBLE PAWN MOVES
		const oneStep: Position = { row: row + direction, col }; // FOR A STEP FORWARD
		const twoStep: Position = { row: row + 2 * direction, col } // FOR TWO STEPS FORWARD FROM STARTING POINT
		const captureLeft: Position = { row: row + direction, col: col - 1} // FOR A CAPTURE ON THE LEFT
		const captureRight: Position = { row: row + direction, col: col + 1} // YOU SHOULD KNOW...

		// A NORMAL STEP FORWARD
		if (board.isWithinBounds(oneStep) && !board.getPiece(oneStep)) {
			moves.push(oneStep);

			// MAKING SURE PAWN IS ON STARTING ROW FOR A TWO-STEP MOVE
			const startingRow: number = this.color === "white" ? 6 : 1;
			if (this.position.row === startingRow) {
				if (board.isWithinBounds(twoStep) && !board.getPiece(twoStep)) moves.push(twoStep);
			}
		}

		// DIAGONAL CAPTURES
		const leftPiece = board.getPiece(captureLeft);
		const rightPiece = board.getPiece(captureRight);

		if (board.isWithinBounds(captureLeft) && leftPiece && leftPiece.color !== this.color) {
			moves.push(captureLeft);
		}
		
		if (board.isWithinBounds(captureRight) && rightPiece && rightPiece.color !== this.color) {
			moves.push(captureRight);
		}


		/* // I'LL IMPLEMENT EN PASSANT MOVES LATER
		// SHOULD BE EASY, A MOVE THAT CHECKS IF A
		// PIECE IS TO THE SIDE AFTER A TWO-STEP
		// FORWARD MOVEMENT... REALIZED I HAVE TO
		// ALSO CHECK THE BOARD HISTORY FOR THAT*/


		// NEED TO DEFINE BEHAVIOUR FOR CAPTURES OR DEATHS...

		// MOVES BEING AN ARRAY OF ALL LEGAL MOVES...
		return moves;
	}
}
