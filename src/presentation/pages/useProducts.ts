import { useState, useEffect, useCallback } from "react";
import { useReload } from "../hooks/useReload";
import { GetProductsUseCase } from "../../domain/GetProductsUseCase";
import { Product } from "../../domain/Product";
import { buildProduct } from "../../data/api/ProductApiRepository";
import { StoreApi } from "../../data/api/StoreApi";
import { useAppContext } from "../context/useAppContext";

export function useProducts(getProductsUseCase: GetProductsUseCase, storeApi: StoreApi) {
    const { currentUser } = useAppContext();
    const [reloadKey, reload] = useReload();
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [error, setError] = useState<string>();

    useEffect(() => {
        getProductsUseCase.execute().then(products => {
            setProducts(products);
        });
    }, [reloadKey]);

    const cancelEditPrice = useCallback(() => {
        setEditingProduct(undefined);
    }, []);

    const updatingQuantity = useCallback(
        async (id: number) => {
            if (id) {
                if (!currentUser.isAdmin) {
                    setError("Only admin users can edit the price of a product");
                    return;
                }

                storeApi
                    .get(id)
                    .then(buildProduct)
                    .then(product => {
                        setEditingProduct(product);
                    })
                    .catch(() => {
                        setError(`Product with id ${id} not found`);
                    });
            }
        },
        [currentUser.isAdmin, storeApi]
    );

    return { products, reload , updatingQuantity, editingProduct, setEditingProduct, error, cancelEditPrice};
}




