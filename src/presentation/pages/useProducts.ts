import { useState, useEffect, useCallback } from "react";
import { useReload } from "../hooks/useReload";
import { GetProductsUseCase } from "../../domain/GetProductsUseCase";
import { Product } from "../../domain/Product";
import { useAppContext } from "../context/useAppContext";
import { GetProductByIdUseCase, ResourceNotFound } from "../../domain/GetProductByIdUseCase";

export function useProducts(getProductsUseCase: GetProductsUseCase, getProductByIdUseCase : GetProductByIdUseCase) {
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

                try {
                    const product = await getProductByIdUseCase.execute(id);
                    setEditingProduct(product);
                } catch(error) {
                    if(error instanceof ResourceNotFound) {
                        setError(error.message);
                    } else {
                        setError("Unexpected error has ocurred");
                    }

                }
                
                               
            }
        },
        [currentUser.isAdmin, getProductByIdUseCase]
    );

    return { products, reload , updatingQuantity, editingProduct, setEditingProduct, error, cancelEditPrice};
}




