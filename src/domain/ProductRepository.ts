import { Product } from "./Product";

export class ResourceNotFound extends Error {}
export interface ProductRepository {
    getAll(): Promise<Product[]>;
    getProductById(id: number): Promise<Product>;
}
