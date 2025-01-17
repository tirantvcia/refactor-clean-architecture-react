import { Product } from "../../domain/Product";
import { ProductRepository, ResourceNotFound } from "../../domain/ProductRepository";
import { RemoteProduct, StoreApi } from "./StoreApi";

export class ProductApiRepository implements ProductRepository {
    constructor(readonly storeApi: StoreApi) {}

    async getAll(): Promise<Product[]> {
        const remoteProducts = await this.storeApi.getAll();
        return remoteProducts.map(buildProduct);
    }

    async getProductById(id: number): Promise<Product> {
        try {
            const remoteProduct = await this.storeApi.get(id);
            return buildProduct(remoteProduct);
        } catch (error) {
            throw new ResourceNotFound(`Product with id ${id} not found`);
        }
    }
}

export function buildProduct(remoteProduct: RemoteProduct): Product {
    return Product.create( {
        id: remoteProduct.id,
        title: remoteProduct.title,
        image: remoteProduct.image,
        price: remoteProduct.price.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
        }),
    });
}
