import { expect, test } from "vitest";
import { describe } from "vitest";
import { Price } from "../Price";

describe("Price", () => {
    test("should create price if all validations are ok", () => {
        const price = Price.create("2.4");
        expect(price).toBeTruthy();
    });
    test("Should throw an error for negative prices", () => {
        expect(() => {
            Price.create("-1.50");
        }).toThrowError("Invalid price format");
    });
    test("Should throw an error for non numbers values", () => {
        expect(() => {
            Price.create("one pound.50");
        }).toThrowError("Only numbers are allowed");
    });
    test("Should throw an error for invalid format, finished with dot", () => {
        expect(() => {
            Price.create("1.");
        }).toThrowError("Invalid price format");
    });
    test("Should throw an error for non numbers values", () => {
        expect(() => {
            Price.create("1000.00");
        }).toThrowError("The max possible price is 999.99");
    });
});
