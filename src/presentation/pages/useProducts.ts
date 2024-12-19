import { useState, useEffect } from "react";
import { RemoteProduct, StoreApi } from "../../data/api/StoreApi";
import { useReload } from "../hooks/useReload";


export function useProducts(storeApi: StoreApi) {
     const [reloadKey, reload] = useReload();
     const [products, setProducts] = useState<Product[]>([]);
     useEffect(() => {
            storeApi.getAll().then(response => {
                console.debug("Reloading", reloadKey);
    
                const remoteProducts = response as RemoteProduct[];
    
                const products = remoteProducts.map(buildProduct);
    
                setProducts(products);
            });
        }, [reloadKey]);
        return {products, reload}
}

export interface Product {
    id: number;
    title: string;
    image: string;
    price: string;
}

export function buildProduct(remoteProduct: RemoteProduct): Product {
    return {
        id: remoteProduct.id,
        title: remoteProduct.title,
        image: remoteProduct.image,
        price: remoteProduct.price.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }),
    };
}