import { expect, test } from "vitest";
import { describe } from "vitest";
import { Product } from "../Product";

describe("Product", () => {
    test("should create product with status active if prices is greater than 00", () => {
        const product = Product.create({
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
            price: "109.95",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        });
        expect(product).toBeTruthy();
        expect(product.status).toBe("active");
    });
    test("should create product with status inactive if prices is equal to 0", () => {
        const product = Product.create({
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
            price: "0.0",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        });
        expect(product).toBeTruthy();
        expect(product.status).toBe("inactive");
    });
    test("should edit product price and assign status active if the price is greater than to 0", () => {
        const product = Product.create({
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
            price: "2.4",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        });
        const editedProduct = product.editPrice("3.9");
        expect(editedProduct.status).toBe("active");
        expect(editedProduct.price.value).toBe(3.9);
    }); 
    test("should edit product price and assign status inactive if prices is equal to 0", () => {
        const product = Product.create({
            id: 1,
            title: "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
            price: "0.5",
            image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        });
        const editedProduct = product.editPrice("0.0");
        expect(editedProduct.status).toBe("inactive");
        expect(editedProduct.price.value).toBe(0);
    });       
});
