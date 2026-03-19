import { Piece, Position } from "../pieces/Piece";
import { Grid, Row, SquareContent } from "../types/grid";

export class Board {
	grid: Grid;
	
	constructor() {
		this.grid = this.createEmptyBoard();
	}

	public size: number = 8;

	private createEmptyBoard(): Grid {
		const grid: Grid = [];

		for (let row = 0; row < this.size; row++) {
			const currentRow: Row = [];

			for (let col = 0; col < this.size; col++) {
				currentRow.push(null);
			}
			grid.push(currentRow);
		}
		return grid;
	}

	isWithinBounds(position: Position): boolean {
		return (
			position.row >= 0 &&
			position.row < this.size &&
			position.col >= 0 &&
			position.col < this.size
		);
	}

	getSquare(row: number, col: number): SquareContent {
		if (!this.isWithinBounds({ row, col })) {
			throw new Error("Square out of bounds");
		}

		return this.grid[row][col];
	}

	setSquare(row: number, col: number, content: SquareContent): void {
		if (!this.isWithinBounds({ row, col })) {
			throw new Error("Square out of bounds");
		}

		this.grid[row][col] = content;
	}

	placePiece(piece: Piece) {
		if (!this.isWithinBounds(piece.position)) {
			throw new Error("Cannot place piece out of bounds");
		}
		const { row, col } = piece.position;
		this.setSquare(row, col, piece);
	}

	getPiece(position: Position): Piece | null {
		if (!this.isWithinBounds(position)) {
			return null;
		}

		return this.getSquare(position.row, position.col);
	}

	movePiece(from: Position, to: Position) {
		if (!this.isWithinBounds(from) || !this.isWithinBounds(to)) {
			throw new Error("Move out of bounds");
		}

		const piece = this.getPiece(from);

		if (!piece) {
			throw new Error("No piece at starting position");
		}

		this.setSquare(to.row, to.col, piece);
		this.setSquare(from.row, from.col, null);

		piece.moveTo(to);
	}
}
