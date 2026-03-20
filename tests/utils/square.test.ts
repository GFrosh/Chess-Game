import { describe, expect, it } from "vitest";
import { algebraicToPosition, positionToAlgebraic } from "../../src/utils/square";

describe("square utilities", () => {
	it("parses valid edge squares", () => {
		expect(algebraicToPosition("a1")).toEqual({ row: 7, col: 0 });
		expect(algebraicToPosition("h8")).toEqual({ row: 0, col: 7 });
		expect(algebraicToPosition("E2")).toEqual({ row: 6, col: 4 });
	});

	it("rejects invalid square strings", () => {
		expect(() => algebraicToPosition("z9")).toThrow("Invalid square");
		expect(() => algebraicToPosition("a0")).toThrow("Invalid square");
		expect(() => algebraicToPosition("a")).toThrow("Invalid square");
		expect(() => algebraicToPosition("")).toThrow("Invalid square");
	});

	it("formats valid positions to algebraic notation", () => {
		expect(positionToAlgebraic({ row: 7, col: 0 })).toBe("a1");
		expect(positionToAlgebraic({ row: 0, col: 7 })).toBe("h8");
	});

	it("rejects out-of-bounds positions", () => {
		expect(() => positionToAlgebraic({ row: -1, col: 0 })).toThrow("Invalid position");
		expect(() => positionToAlgebraic({ row: 8, col: 0 })).toThrow("Invalid position");
		expect(() => positionToAlgebraic({ row: 0, col: 8 })).toThrow("Invalid position");
	});
});