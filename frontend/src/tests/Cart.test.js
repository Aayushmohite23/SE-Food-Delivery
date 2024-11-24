import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Cart from '../pages/Cart';
import { BrowserRouter as Router } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import { getCartItems, getMenu, removeCartItem } from '../utils/APIroutes';

const mock = new MockAdapter(axios);

describe("Cart component", () => {
    beforeEach(() => {
        mock.reset();
    });

    test("renders empty cart message if no items in cart", async () => {
        mock.onGet(getCartItems).reply(200, { status: true, cart: [] });
        mock.onGet(getMenu).reply(200, { status: true, menu: [] });

        await act(async () => {
            render(<Router><Cart /></Router>);
        });

        expect(screen.getByTestId('empty-cart-message')).toBeInTheDocument();
    });

    test("fetches and displays cart items with subtotal", async () => {
        const mockCart = [{ _id: "1", quantity: 2 }];
        const mockMenu = [{ _id: "1", name: "Burger", price: 5.99, image: "burger.jpg" }];
        
        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });
        mock.onGet(getMenu).reply(200, { status: true, menu: mockMenu });

        await act(async () => {
            render(<Router><Cart /></Router>);
        });

        await waitFor(() => {
            expect(screen.getByText('Burger')).toBeInTheDocument();
            expect(screen.getByText('$5.99')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByTestId("subtotal")).toHaveTextContent('$11.98');
        });
    });

    test("applies promo code successfully", async () => {
        const mockCart = [{ _id: "1", quantity: 2 }];
        const mockMenu = [{ _id: "1", name: "Burger", price: 5.99, image: "burger.jpg" }];

        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });
        mock.onGet(getMenu).reply(200, { status: true, menu: mockMenu });

        await act(async () => {
            render(<Router><Cart /></Router>);
        });

        const promoCodeInput = screen.getByTestId("promo-code-input");
        const promoSubmitButton = screen.getByTestId("promo-submit-button");

        await act(async () => {
            fireEvent.change(promoCodeInput, { target: { value: 'PROMO10' } });
            fireEvent.click(promoSubmitButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Promo code "PROMO10" applied!')).toBeInTheDocument();
            expect(screen.getByTestId("discount")).toHaveTextContent("- $7.99");
        });
    });

    test("removes item from cart", async () => {
        const mockCart = [{ _id: "1", quantity: 1 }];
        const mockMenu = [{ _id: "1", name: "Burger", price: 5.99, image: "burger.jpg" }];
        const updatedCart = [];

        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });
        mock.onGet(getMenu).reply(200, { status: true, menu: mockMenu });

        const {rerender} = render(<Router><Cart /></Router>);

        // Verify initial item is displayed
        await waitFor(() => expect(screen.getByText('Burger')).toBeInTheDocument());

        mock.onDelete(`${removeCartItem}/1`).reply(200, { status: true });
        mock.onGet(getCartItems).reply(200, { status: true, cart: updatedCart});

        const removeButton = screen.getByTestId("remove-item-1");

        // Remove item
        fireEvent.click(removeButton);

        rerender(<Router><Cart /></Router>);

        await waitFor(() => {
            expect(screen.getByTestId("empty-cart-message")).toBeInTheDocument();
        });
    });

    test("displays error message if fetching cart items fails", async () => {
        mock.onGet(getCartItems).reply(500);  // Simulate a failed response

        render(<Router><Cart /></Router>);

        // Wait for error message to appear
        await waitFor(() => {
            expect(screen.getByTestId("error-fetching")).toBeInTheDocument();
            // expect(screen.getByTestId("error-fetching")).toHaveTextContent("Could not fetch cart items right now. Please try again.");
        });
    });

    test("displays error message if fetching menu items fails", async () => {
        const mockCart = [{ _id: "1", quantity: 1 }];
        mock.onGet(getCartItems).reply(200, { status: true, cart: mockCart });
        mock.onGet(getMenu).reply(500);  // Simulate a failed response

        render(<Router><Cart /></Router>);

        // Wait for error message to appear
        await waitFor(() => {
            expect(screen.getByTestId("error-fetching")).toBeInTheDocument();
            // expect(screen.getByTestId("error-menu-items")).toHaveTextContent("Could not fetch menu right now. Please try again.");
        });
    });
});
