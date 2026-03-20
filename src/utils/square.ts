import { Position } from "../pieces/Piece";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function algebraicToPosition(square: string): Position {
	const file = square[0];
	const rank = Number(square[1]);

	const col = files.indexOf(file);
	const row = 8 - rank;

	if (col === -1 || row < 0 || row > 7) {
		throw new Error("Invalid square");
	}

  	return { row, col };
}

export function positionToAlgebraic(position: Position): string {
	const file = files[position.col];
	const rank = 8 - position.row;

	return `${file}${rank}`;
}

// Re-export position utilities
export * from "./positionUtils";
