import { useState, useEffect, useCallback } from "react";
import { useReload } from "../hooks/useReload";
import { GetProductsUseCase } from "../../domain/GetProductsUseCase";
import { Product } from "../../domain/Product";
import { useAppContext } from "../context/useAppContext";
import { GetProductByIdUseCase } from "../../domain/GetProductByIdUseCase";
import { ResourceNotFound } from "../../domain/ProductRepository";

export function useProducts(
    getProductsUseCase: GetProductsUseCase,
    getProductByIdUseCase: GetProductByIdUseCase
) {
    const { currentUser } = useAppContext();
    const [reloadKey, reload] = useReload();
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [error, setError] = useState<string>();
    const [priceError, setPriceError] = useState<string | undefined>(undefined);

    useEffect(() => {
        getProductsUseCase.execute().then(products => {
            setProducts(products);
        });
    }, [reloadKey, getProductsUseCase]);

    const cancelEditPrice = useCallback(() => {
        setEditingProduct(undefined);
    }, [setEditingProduct]);

    const priceRegex = /^\d+(\.\d{1,2})?$/;
     
    function onChangePrice(price: string): void {
        if (!editingProduct) return;

        const isValidNumber = !isNaN(+price);
        setEditingProduct({ ...editingProduct, price: price });

        if (!isValidNumber) {
            setPriceError("Only numbers are allowed");
        } else {
            if (!priceRegex.test(price)) {
                setPriceError("Invalid price format");
            } else if (+price > 999.99) {
                setPriceError("The max possible price is 999.99");
            } else {
                setPriceError(undefined);
            }
        }
    }

    const updatingQuantity = useCallback(
        async (id: number) => {
            if (id) {
                if (!currentUser.isAdmin) {
                    setError("Only admin users can edit the price of a product");
                    return;
                }

                try {
                    const product = await getProductByIdUseCase.execute(id);
                    setEditingProduct(product);
                } catch (error) {
                    if (error instanceof ResourceNotFound) {
                        setError(error.message);
                    } else {
                        setError("Unexpected error has ocurred");
                    }
                }
            }
        },
        [currentUser.isAdmin, getProductByIdUseCase]
    );

    return {
        products,
        reload,
        updatingQuantity,
        editingProduct,
        setEditingProduct,
        error,
        cancelEditPrice,
        onChangePrice,
        priceError,
    };
}
