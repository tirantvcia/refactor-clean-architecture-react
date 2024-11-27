
import { MockWebServer } from "../../../tests/MockWebServer";
import productsReponse from "./data/productsResponse.json";

export function givenAProducts (mockWebServer: MockWebServer) {
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


export function givenThereAreNoProducts (mockWebServer: MockWebServer) {
    mockWebServer.addRequestHandlers(
        [
            {
                method: "get",
                endpoint: "https://fakestoreapi.com/products",
                httpStatusCode: 200,
                response: [],
            },
        ]
    );
}