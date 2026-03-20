import { Position } from "../pieces/Piece";


// Check if two positions are identical
export function arePositionsEqual(p1: Position, p2: Position): boolean {
	return p1.row === p2.row && p1.col === p2.col;
}


// Find a position in an array of positions
export function findPosition(positions: Position[], target: Position): Position | undefined {
	return positions.find(pos => arePositionsEqual(pos, target));
}


// Get Manhattan distance between two positions
export function getDistance(p1: Position, p2: Position): number {
	return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
}


// Check if two positions are on the same row
export function isSameRow(p1: Position, p2: Position): boolean {
	return p1.row === p2.row;
}

// Check if two positions are on the same column
export function isSameCol(p1: Position, p2: Position): boolean {
	return p1.col === p2.col;
}

// Check if two positions are on the same diagonal
export function isSameDiagonal(p1: Position, p2: Position): boolean {
	return Math.abs(p1.row - p2.row) === Math.abs(p1.col - p2.col);
}
