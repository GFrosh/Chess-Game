import { Board } from "../board/Board";
import { Piece, Position, Color } from "./Piece";

export class Knight extends Piece {
    constructor(color: Color, position: Position) {
        super("knight", color, position);
    }

    getLegalMoves(board: Board): Position[] {
        const moves: Position[] = [];
        const direction: number = this.color === "white" ? -1 : 1;
        const { row, col } = this.position;

        // STILL THINKING OF HOW TO IMPLEMENT A KNIGHT MOVEMENTS
        // KINDA COMPLEX THO
        const LJumpOne: Position = {
            row: row + 1 * direction,
            col: col - 2
        } // 22.5 degrees...
        const LJumpTwo: Position = {
            row: row + 2 * direction,
            col: col - 1
        } // 67.5 degrees...
        const LJumpThree: Position = {
            row: row + 2 * direction,
            col: col + 1
        } // 112.5 degrees...
        const LJumpFour: Position = {
            row: row + 1 * direction,
            col: col + 2
        } // 135 degrees...
        const LJumpFive: Position = {
            row: row - 1 * direction,
            col: col + 2
        } // 157.5 degrees...
        const LJumpSix: Position = {
            row: row - 2 * direction,
            col: col - 1
        } // 180 degrees...
        const LJumpSeven: Position = {
            row: row - 2 * direction,
            col: col - 1
        } // 202.5 degrees...
        const LJumpEight: Position = {
            row: row - 1 * direction,
            col: col - 2
        } // 247.5 degrees...
        

        return moves;
    }
}
