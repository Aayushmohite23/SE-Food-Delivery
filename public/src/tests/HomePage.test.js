import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import HomePage from '../pages/HomePage';
import { BrowserRouter as Router } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { getMenu, getCartItems, increaseCartItem, decreaseCartItem } from '../utils/APIroutes';

const mock = new MockAdapter(axios);

describe("HomePage component", () => {
    beforeEach(() => {
        mock.reset();
    });

    test("renders without crashing", () => {
        render(<Router><HomePage /></Router>);
        expect(screen.getByText('Order your')).toBeInTheDocument();
        expect(screen.getByText('favourite food here')).toBeInTheDocument();
    });

    test("fetches and displays menu items", async () => {
        const mockMenu = [
            { _id: "1", name: "Caesar Salad", category: "Salad", price: 5.99, image: "salad.jpg" }
        ];

        mock.onGet(getMenu).reply(200, { status: true, menu: mockMenu });
        render(<Router><HomePage /></Router>);

        await waitFor(() => expect(screen.getByTestId("menu-item-1")).toBeInTheDocument());
    });

    test("fetches and displays cart items", async () => {
        const mockCart = [{ _id: "1", quantity: 2 }];
        mock.onGet(getMenu).reply(200, { status: true, menu: [{ _id: "1", name: "Caesar Salad", category: "Salad", price: 5.99, image: "salad.jpg" }] });
        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });

        render(<Router><HomePage/></Router>);

        await waitFor(() => {
            expect(screen.getByTestId("quantity-1")).toHaveTextContent("2");
        });
    });

    test("increases quantity of an item", async () => {
        const itemId = "1";
        const mockCart = [{ _id: itemId, quantity: 1 }];
        const updatedMockCart = [{ _id: itemId, quantity: 2 }];

        // Set initial mock responses
        mock.onGet(getMenu).reply(200, { status: true, menu: [{ _id: itemId, name: "Caesar Salad", category: "Salad", price: 5.99, image: "salad.jpg" }] });
        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });

        const {rerender} = render(<Router><HomePage /></Router>);

        // Verify initial quantity is 1
        await waitFor(() => expect(screen.getByTestId("quantity-1")).toHaveTextContent("1"));
        
        // Mock increaseCartItem API call and set updated response for getCartItems after increase
        mock.onPatch(`${increaseCartItem}/${itemId}`, {quantity: 1}).reply(200, { status: true });
        mock.onGet(getCartItems).reply(200, { status: true, cart: updatedMockCart });

        // Trigger increase action
        fireEvent.click(screen.getByTestId(`plus-${itemId}`));

        rerender(<Router><HomePage /></Router>);

        // Verify updated quantity is 2
        await waitFor(() => expect(screen.getByTestId("quantity-1")).toHaveTextContent("2"));
    });

    test("displays error message if menu fetch fails", async () => {
        mock.onGet(getMenu).reply(500);

        render(<Router><HomePage /></Router>);

        // Verify that the error message is displayed
        await waitFor(() => expect(screen.getByText('Failed to load menu')).toBeInTheDocument());
    });
});
