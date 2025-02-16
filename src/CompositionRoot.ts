import { ProductApiRepository } from "./data/api/ProductApiRepository";
import { StoreApi } from "./data/api/StoreApi";
import { GetProductByIdUseCase } from "./domain/GetProductByIdUseCase";
import { GetProductsUseCase } from "./domain/GetProductsUseCase";
import { UpdateProductPriceUseCase } from "./domain/UpdateProductPriceUseCase";

export class CompositionRoot {
    private constructor() {}

    private static instance: CompositionRoot;

    private storeApi = new StoreApi();
    productRepository = new ProductApiRepository(this.storeApi);

    public static getInstance(): CompositionRoot {
        if (!CompositionRoot.instance) {
            CompositionRoot.instance = new CompositionRoot();
        }
        return CompositionRoot.instance;
    }

    provideGetProductsUseCase(): GetProductsUseCase {
        return new GetProductsUseCase(this.productRepository);
    }
    provideGetProductByIdUseCase(): GetProductByIdUseCase {
        return new GetProductByIdUseCase(this.productRepository);
    }

    provideUpdateProductPriceUseCase(): UpdateProductPriceUseCase {
        return new UpdateProductPriceUseCase(this.productRepository);
    }
}
