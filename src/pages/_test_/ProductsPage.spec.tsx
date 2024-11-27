import { afterAll, afterEach, beforeAll, describe, test } from "vitest";
import { render, RenderResult, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { AppProvider } from "../../context/AppProvider";
import { ProductsPage } from "../ProductsPage";
import { MockWebServer } from "../../tests/MockWebServer";
import productsReponse from "./data/productsResponse.json"

const mockWebServer = new MockWebServer();

describe("Products page", () => {
    beforeAll(
        () => mockWebServer.start()
    );
    afterEach(
        () => mockWebServer.resetHandlers()
    );
    afterAll(
        () => mockWebServer.close()
    );
    test("Loads and displays title", async () => {
        givenAProducts();
        renderComponent(<ProductsPage />);
        await screen.findAllByRole("heading", { name: "Product price updater" });
    });

});


function renderComponent(component: ReactNode): RenderResult {
    return render(<AppProvider>{component}</AppProvider>);
}

function givenAProducts () {
    mockWebServer.addRequestHandlers(
        [
            {
                method: "get",
                endpoint: "https://fakestoreapi.com/products",
                httpStatusCode: 200,
                response: productsReponse,
            },
        ]
    );
}
