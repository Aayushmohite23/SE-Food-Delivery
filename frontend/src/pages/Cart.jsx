import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import styled from "styled-components";
import {getMenu, getCartItems, removeCartItem} from '../utils/APIroutes';
// import {foodImages} from '../utils/frontend_assets/assets';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const toastOptions =
{
    position: "bottom-right",
    autoClose: 3000,
    draggable: true,
    pauseOnHover: true,
    theme: "dark"
};

function Cart()
{
    const navigate = useNavigate();

    const shippingCost = 5.00;
    const [cart, setCart] = useState([]);
    const [subtotal, setSubtotal] = useState(0);
    const [promoCode, setPromoCode] = useState(() => {
        const promoCode = sessionStorage.getItem('promo-code');
        return promoCode !== null ? JSON.parse(promoCode) : '';
    });
    const [promoCodeValid, setPromoCodeValid] = useState(false);
    const [discount, setDiscount] = useState(0);

    const fetchCart = async () => {
        try
        {
            const {data: {status: cartStatus, cart, msg: cartMsg}} = await axios(getCartItems);
            const {data: {status: menuStatus, menu, msg: menuMsg}} = await axios(getMenu);
            if(!cartStatus)
            {
                toast.error(<div data-testid="error-cart-items">{cartMsg}</div>, toastOptions);
            }
            else if(!menuStatus)
            {
                toast.error(<div data-testid="error-menu-items">{menuMsg}</div>, toastOptions);
            }
            else
            {
                const arr = [];
                cart.forEach((cartItem) => {
                    const menuItem = menu.find(i => i._id === cartItem._id);
                    arr.push({ ...menuItem, ...cartItem });
                });
                setCart(arr);
            }
        }
        catch(error)
        {
            toast.error(<div data-testid="error-fetching">Failed to fetch data</div>, toastOptions);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [navigate]);

    useEffect(() => {
        const newSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setSubtotal(newSubtotal);
    }, [cart]);

    const calculateTotal = (price, quantity) => {
        return (price * quantity).toFixed(2);
    };

    async function handleRemove(_id)
    {
        try
        {
            const {data: {status, msg}} = await axios.delete(`${removeCartItem}/${_id}`);
            if(status)
            {
                fetchCart();
            }
            else
            {
                toast.error(<div data-testid="error-remove-item">{msg}</div>, toastOptions);
            }
        }
        catch(error)
        {
            toast.error(<div data-testid="error-remove-item">Error removing item</div>, toastOptions);
        }
    }

    const handlePromoCodeSubmit = (event) => {
        event.preventDefault();
        if(!promoCode) return;

        // Add functionality for promo code submission here
        sessionStorage.setItem('promo-code', JSON.stringify(promoCode));
        toast.success(`Promo code "${promoCode}" applied!`, toastOptions);
        setPromoCodeValid(true);
        setDiscount(7.99);
    };

    const handleCheckout = () => {
        sessionStorage.setItem('subtotal', JSON.stringify(subtotal));
        sessionStorage.setItem('shippingCost', JSON.stringify(shippingCost));
        sessionStorage.setItem('discount', JSON.stringify(discount));

        const newCart = [];
        cart.forEach((item) => {
            newCart.push({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            });
        });
        // console.log(newCart);
        // navigate('/order', {state: {newCart}});
    };

    return (
        <>
            <Container>
                <Navbar/>
                {cart.length === 0 ? (
                    <EmptyCartMessage data-testid="empty-cart-message">
                        <h1>Your Cart is Empty!</h1>
                        <p>It looks like you haven't added any items to your cart yet.</p>
                        <BrowseLink onClick={() => navigate('/')}>Browse Menu</BrowseLink>
                    </EmptyCartMessage>
                ) : (
                    <>
                        <CartTable data-testid="cart-table">
                            <thead>
                                <tr>
                                    <th>Items</th>
                                    <th>Title</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item) => (
                                    <tr key={item._id}>
                                        <td><ItemImage src={item.image} alt={item.name}/></td>
                                        <td>{item.name}</td>
                                        <td>${item.price}</td>
                                        <td>{item.quantity}</td>
                                        <td data-testid={`item-total-${item._id}`}>${calculateTotal(item.price, item.quantity)}</td>
                                        <td>
                                            <RemoveButton data-testid={`remove-item-${item._id}`} onClick={() => handleRemove(item._id)}>x</RemoveButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </CartTable>

                        <TotalsAndPromo>
                            <CartTotals data-testid="cart-totals">
                                <h2>Cart Totals</h2>
                                <TotalRow>
                                    <span>Subtotal:</span>
                                    <span data-testid="subtotal">${subtotal.toFixed(2)}</span>
                                </TotalRow>
                                <TotalRow>
                                    <span>Shipping:</span>
                                    <span data-testid="shipping-cost">${shippingCost.toFixed(2)}</span>
                                </TotalRow>
                                {promoCodeValid && (
                                    <TotalRow>
                                        <span>Discount:</span>
                                        <span data-testid="discount">- ${discount.toFixed(2)}</span>
                                    </TotalRow>
                                )}
                                <TotalRow total>
                                    <span>Total:</span>
                                    <span data-testid="total">${(subtotal + shippingCost - discount).toFixed(2)}</span>
                                </TotalRow>
                                <CheckoutButton onClick={handleCheckout}>Proceed to Checkout</CheckoutButton>
                            </CartTotals>

                            <PromoSection data-testid="promo-section">
                                <p>If you have a promo code, Enter it here</p>
                                <div className="input-and-submit">
                                    <PromoInput
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder="Promo Code"
                                        data-testid="promo-code-input"
                                    />
                                    <PromoButton onClick={handlePromoCodeSubmit} data-testid="promo-submit-button">Submit</PromoButton>
                                </div>
                            </PromoSection>
                        </TotalsAndPromo>
                    </>
                )}
            </Container>
            <ToastContainer/>
        </>
    );
}

const Container = styled.div`
    height: 100vh;
    width: 80vw;
    display: flex;
    flex-direction: column;
    margin: 0 10vw 0 10vw;
`;

const CartTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 2rem;

    th, td
    {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th
    {
        background-color: #f2f2f2;
        font-weight: bold;
    }
`;

const ItemImage = styled.img`
    width: 50px;
    height: 50px;
    object-fit: cover;
`;

const RemoveButton = styled.button`
    background: none;
    border: none;
    color: red;
    font-size: 1.2rem;
    cursor: pointer;
`;

const CartTotals = styled.div`
    margin-top: 2rem;
    padding: 1rem;
    background-color: #f8f8f8;
    border-radius: 5px;
    width: 30vw;
    align-self: flex-start;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const TotalRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-weight: ${props => props.total ? 'bold' : 'normal'};
    font-size: ${props => props.total ? '1.2rem' : '1rem'};
`;

const CheckoutButton = styled.button`
    background-color: #fc5c23;
    color: white;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    width: 50%;

    &:hover
    {
        background-color: #db511f;
    }
`;

const TotalsAndPromo = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 2rem;
`;

const PromoSection = styled.div`
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 5px;
    width: 30vw;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    .input-and-submit
    {
        display: flex;
    }
`;

const PromoInput = styled.input`
    background-color: #f8f8f8;
    padding: 0.7rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 25vw;
    margin-right: 1rem;
    &:focus
    {
        outline: none;
    }
`;

const PromoButton = styled.button`
    width: 5vw;
    padding: 0.7rem;
    border: none;
    background-color: black;
    color: white;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #333;
    }
`;

const EmptyCartMessage = styled.div`
    text-align: center;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 10px;
    max-width: 500px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

    h1 {
        font-size: 2rem;
        color: #fc5c23;
    }

    p {
        font-size: 1.2rem;
        color: #555;
    }
`;

const BrowseLink = styled.button`
    background-color: #fc5c23;
    color: white;
    padding: 0.7rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;

    &:hover {
        background-color: #db511f;
    }
`;

export default Cart;