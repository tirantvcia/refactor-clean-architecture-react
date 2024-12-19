import { useState, useEffect } from "react";
import { RemoteProduct, StoreApi } from "../../data/api/StoreApi";
import { useReload } from "../hooks/useReload";
import { GetProductsUseCase } from "../../domain/GetProductsUseCase";
import { Product } from "../../domain/Product";


export function useProducts(getProductsUseCase: GetProductsUseCase) {
     const [reloadKey, reload] = useReload();
     const [products, setProducts] = useState<Product[]>([]);
     
     useEffect(() => {
        getProductsUseCase.execute().then(products => {
            setProducts(products);
        });
        }, [reloadKey]);
        return {products, reload}
}



