import { describe, expect, it } from "vitest";
import {
	arePositionsEqual,
	findPosition,
	getDistance,
	isSameCol,
	isSameDiagonal,
	isSameRow
} from "../../src/utils/positionUtils";

describe("positionUtils", () => {
	it("compares positions correctly", () => {
		expect(arePositionsEqual({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true);
		expect(arePositionsEqual({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false);
	});

	it("finds matching positions", () => {
		const positions = [
			{ row: 7, col: 0 },
			{ row: 3, col: 3 },
			{ row: 0, col: 7 }
		];

		expect(findPosition(positions, { row: 3, col: 3 })).toEqual({ row: 3, col: 3 });
		expect(findPosition(positions, { row: 4, col: 4 })).toBeUndefined();
	});

	it("computes Manhattan distance", () => {
		expect(getDistance({ row: 7, col: 0 }, { row: 0, col: 7 })).toBe(14);
		expect(getDistance({ row: 4, col: 4 }, { row: 4, col: 4 })).toBe(0);
	});

	it("checks row, column, and diagonal relationships", () => {
		expect(isSameRow({ row: 6, col: 0 }, { row: 6, col: 7 })).toBe(true);
		expect(isSameCol({ row: 0, col: 3 }, { row: 7, col: 3 })).toBe(true);
		expect(isSameDiagonal({ row: 0, col: 0 }, { row: 7, col: 7 })).toBe(true);
		expect(isSameDiagonal({ row: 0, col: 0 }, { row: 7, col: 6 })).toBe(false);
	});
});