import { Position } from "../pieces/Piece";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function algebraicToPosition(square: string): Position {
	if (!/^[a-h][1-8]$/i.test(square)) {
		throw new Error("Invalid square");
	}

	const file = square[0].toLowerCase();
	const rank = Number(square[1]);

	const col = files.indexOf(file);
	const row = 8 - rank;

	if (col === -1 || row < 0 || row > 7) {
		throw new Error("Invalid square");
	}

  	return { row, col };
}

export function positionToAlgebraic(position: Position): string {
	if (
		position.row < 0 ||
		position.row > 7 ||
		position.col < 0 ||
		position.col > 7
	) {
		throw new Error("Invalid position");
	}

	const file = files[position.col];
	const rank = 8 - position.row;

	return `${file}${rank}`;
}

// Re-export position utilities
export * from "./positionUtils";
