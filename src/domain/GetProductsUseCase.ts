import { ProductApiRepository } from "../data/api/ProductApiRepository";
import { Product } from "./Product";

export class GetProductsUseCase {
    constructor(readonly productApiRepository: ProductApiRepository) {}

    async execute(): Promise<Product[]> {
        return this.productApiRepository.getAll();
    }
}
