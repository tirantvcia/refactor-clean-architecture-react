import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { render, RenderResult, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { AppProvider } from "../../../context/AppProvider";
import { ProductsPage } from "../../ProductsPage";
import { MockWebServer } from "../../../../tests/MockWebServer";
import { givenAProducts, givenThereAreNoProducts } from "./ProductsPage.fixture";
import {
    changeToNonAdminUser,
    openDialogToEditPrice,
    savePrice,
    tryOpenDialogToEditPrice,
    typePrice,
    verifyDialog,
    verifyError,
    verifyHeader,
    verifyPriceAndStatusInRow,
    verifyRows,
    verifySaveButtonIsDisabled,
    waitTableIsLoaded,
} from "./ProductsPage.helpers";

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
            await verifySaveButtonIsDisabled(dialog);
        });
        test("should show an error for non number price", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            await typePrice(dialog, "nonnumeric");
            await verifyError(dialog, "Only numbers are allowed");
            await verifySaveButtonIsDisabled(dialog);
        });
        test("should show an error for prices greater than maximum", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            await typePrice(dialog, "10000");
            await verifyError(dialog, "The max possible price is 999.99");
            await verifySaveButtonIsDisabled(dialog);
        });
        test("should edit price correctly and mark status as active for a price greater than 0", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            const newPrice = "100.00";
            await typePrice(dialog, newPrice);
            await savePrice(dialog);
            await verifyPriceAndStatusInRow(0, newPrice, "active");
        });
        test("should edit price correctly and mark status as inactive for a price equals 0", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();

            const dialog = await openDialogToEditPrice(0);
            const newPrice = "0.00";
            await typePrice(dialog, newPrice);
            await savePrice(dialog);
            await verifyPriceAndStatusInRow(0, newPrice, "inactive");
        });
        test("should show an error if the user is not admin", async () => {
            givenAProducts(mockWebServer);
            renderComponent(<ProductsPage />);
            await waitTableIsLoaded();
            await changeToNonAdminUser();
            await tryOpenDialogToEditPrice(0);
            await screen.findByText("Only admin users can edit the price of a product");
        });
    });
});

function renderComponent(component: ReactNode): RenderResult {
    return render(<AppProvider>{component}</AppProvider>);
}
