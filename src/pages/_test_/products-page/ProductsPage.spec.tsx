import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { render, RenderResult, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { AppProvider } from "../../../context/AppProvider";
import { ProductsPage } from "../../ProductsPage";
import { MockWebServer } from "../../../tests/MockWebServer";
import { givenAProducts, givenThereAreNoProducts } from "./ProductsPage.fixture";
import {
    openDialogToEditPrice,
    typePrice,
    verifyDialog,
    verifyError,
    verifyHeader,
    verifyRows,
    waitTableIsLoaded,
} from "./ProductsPage.helpers";
import { RemoteProduct } from "../../../api/StoreApi";

const mockWebServer = new MockWebServer();

describe("Products page", () => {
    beforeAll(() => mockWebServer.start());
    afterEach(() => mockWebServer.resetHandlers());
    afterAll(() => mockWebServer.close());
    test("Loads and displays title", async () => {
        givenAProducts(mockWebServer);
        renderComponent(<ProductsPage />);
        await screen.findAllByRole("heading", { name: "Product price updater" });
    });

    describe("Table", () => {
        test("should show an empty table if there are no data", async () => {
            givenThereAreNoProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            const rows = await screen.findAllByRole("row");
            expect(rows.length).toBe(1);
            verifyHeader(rows[0]);
        });
        test("should show expected rows in the table", async () => {
            const products = givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();
            const allRows = await screen.findAllByRole("row");
            const [header, ...rows] = allRows;

            verifyHeader(header);
            verifyRows(rows, products);
        });
    });

    describe("Edit price", () => {
        test("should show a dialog with the product", async () => {
            const products = givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            verifyDialog(dialog, products[0]);
        });
        test("should show an error for negative prices", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            await typePrice(dialog, "-4");
            await verifyError(dialog, "Invalid price format");
        });
        test("should show an error for non number price", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            await typePrice(dialog, "nonnumeric");
            await verifyError(dialog, "Only numbers are allowed");
        });    
        test("should show an error for prices greater than maximum", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            await typePrice(dialog, "10000");
            await verifyError(dialog, "The max possible price is 999.99");
        });      
    });
});

function renderComponent(component: ReactNode): RenderResult {
    return render(<AppProvider>{component}</AppProvider>);
}



