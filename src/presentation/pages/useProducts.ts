import { useState, useEffect, useCallback } from "react";
import { useReload } from "../hooks/useReload";
import { GetProductsUseCase } from "../../domain/GetProductsUseCase";
import { Product } from "../../domain/Product";
import { useAppContext } from "../context/useAppContext";
import { GetProductByIdUseCase } from "../../domain/GetProductByIdUseCase";
import { ResourceNotFound } from "../../domain/ProductRepository";
import { Price, ValidationError } from "../../domain/Price";
import {
    ActionNotAllowedError,
    UpdateProductPriceUseCase,
} from "../../domain/UpdateProductPriceUseCase";
import { Message, ProductViewModel } from "./useProductsState";

export function useProducts(
    getProductsUseCase: GetProductsUseCase,
    getProductByIdUseCase: GetProductByIdUseCase,
    updateProductPriceUseCase: UpdateProductPriceUseCase
) {
    const { currentUser } = useAppContext();
    const [reloadKey, reload] = useReload();
    const [products, setProducts] = useState<ProductViewModel[]>([]);
    const [editingProduct, setEditingProduct] = useState<ProductViewModel | undefined>(undefined);
    const [message, setMessage] = useState<Message>();
    const [priceError, setPriceError] = useState<string | undefined>(undefined);

    useEffect(() => {
        getProductsUseCase.execute().then(products => {
            const productsViewModel = products.map(product => buildProductViewModel(product));
            setProducts(productsViewModel);
        });
    }, [reloadKey, getProductsUseCase]);

    const cancelEditPrice = useCallback(() => {
        setEditingProduct(undefined);
    }, [setEditingProduct]);

    const onChangePrice = useCallback(
        (price: string) => {
            if (!editingProduct) return;

            try {
                setEditingProduct({ ...editingProduct, price: price });
                Price.create(price);
                setPriceError(undefined);
            } catch (error) {
                if (error instanceof ValidationError) {
                    setPriceError(error.message);
                } else {
                    setPriceError("Unexpected error has ocurred");
                }
            }
        },
        [editingProduct]
    );

    const updatingQuantity = useCallback(
        async (id: number) => {
            if (id) {
                if (!currentUser.isAdmin) {
                    setMessage({
                        type: "error",
                        text: "Only admin users can edit the price of a product",
                    });
                    return;
                }

                try {
                    const product = await getProductByIdUseCase.execute(id);
                    setEditingProduct(buildProductViewModel(product));
                } catch (error) {
                    if (error instanceof ResourceNotFound) {
                        setMessage({ type: "error", text: error.message });
                    } else {
                        setMessage({ type: "error", text: "Unexpected error has ocurred" });
                    }
                }
            }
        },
        [currentUser.isAdmin, getProductByIdUseCase]
    );

    const saveEditPrice = useCallback(async () => {
        if (editingProduct) {
            try {
                await updateProductPriceUseCase.execute(
                    currentUser,
                    editingProduct.id,
                    editingProduct.price
                );
                setMessage({
                    type: "success",
                    text: `Price ${editingProduct.price} for '${editingProduct.title}' updated`,
                });
                setEditingProduct(undefined);
                reload();
            } catch (error) {
                if (error instanceof ActionNotAllowedError) {
                    setMessage({ type: "error", text: error.message });
                } else {
                    setMessage({
                        type: "error",
                        text: `An error has ocurred updating the price ${editingProduct.price} for '${editingProduct.title}'`,
                    });
                    setEditingProduct(undefined);
                    reload();
                }
            }
        }
    }, [currentUser, editingProduct, reload, updateProductPriceUseCase]);

    const onCloseMessage = useCallback(() => {
        setMessage(undefined);
    }, []);

    return {
        products,
        updatingQuantity,
        editingProduct,
        message,
        cancelEditPrice,
        onChangePrice,
        priceError,
        saveEditPrice,
        onCloseMessage,
    };
}

function buildProductViewModel(product: Product): ProductViewModel {
    return {
        ...product,
        price: "" + product.price.value.toFixed(2),
    };
}
