import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import Navbar from '../components/Navbar';
import styled from "styled-components";
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import AnchorLink from "react-anchor-link-smooth-scroll";
import BackgroundFood from "../utils/header_img.png";
import {menu_list} from '../utils/assets';
import {getMenu, getCartItems, increaseCartItem, decreaseCartItem} from '../utils/APIroutes';
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


function HomePage()
{
    const navigate = useNavigate();
    const [itemsList, setItemsList] = useState([]); // Cart items with quantities
    const [menu, setMenu] = useState([]); // Food menu items
    const [selectedCuisine, setSelectedCuisine] = useState('');
    // axios.defaults.withCredentials = true;

    useEffect(() => {
        const fetchMenu = async () => {
            try
            {
                // console.log(images);
                const {data} = await axios(getMenu);
                if(data.status)
                {
                    setMenu(data.menu);
                }
                else toast.error(`${data.msg}`, toastOptions);
            }
            catch(error)
            {
                toast.error("Failed to load menu", toastOptions);
            }
        };
        fetchMenu();

        initializeList();
    }, [navigate]);

    // Fetch the cart items and initialize state
    async function initializeList()
    {
        try
        {
            const {data} = await axios(getCartItems);
            if(data.status)
            {
                const {cart} = data;
                // const {data: {length}} = await axios(getMenuLength);
                const arr = [];
                cart.forEach(cartItem => arr.push(cartItem));

                setItemsList(arr);
            }
            else
            {
                toast.error(`${data.msg}`, toastOptions);
            }
        }
        catch(error)
        {
            toast.error("Failed to load cart items", toastOptions);
        }
    }

    // Function to increase quantity of an item
    async function increaseQuantity(_id)
    {
        try
        {            
            const item = itemsList.find(item => item._id === _id);
            const quantity = item ? item.quantity : 0;
            
            const {data} = await axios.patch(`${increaseCartItem}/${_id}`, {quantity: quantity});
            if(data.status)
            {
                initializeList();
            }
            else
            {
                toast.error(`${data.msg}`, toastOptions);
            }
        }
        catch(error)
        {
            toast.error("Error increasing quantity", toastOptions);
        }
    }

    // Function to decrease quantity of an item
    async function decreaseQuantity(_id)
    {
        try
        {
            const item = itemsList.find(item => item._id === _id);
            const quantity = item ? item.quantity : 0;

            const {data} = await axios.patch(`${decreaseCartItem}/${_id}`, {quantity: quantity});
            if(data.status)
            {
                initializeList();
            }
            else
            {
                toast.error(`${data.msg}`, toastOptions);
            }
        }
        catch(error)
        {
            toast.error("Error decreasing quantity", toastOptions);
        }
    }

    const fetchCuisineItems = async (cuisine) => {
        if(selectedCuisine === cuisine) cuisine = '';
        const {data} = await axios(`${getMenu}?cuisine=${cuisine}`);
        if(data.status)
        {
            setMenu(data.menu);
            setSelectedCuisine(cuisine);
        }
        else toast.error(`${data.msg}`, toastOptions);
    };

    // Display each cuisine type
    function displayCuisine()
    {
        return menu_list.map((cuisine) => (
            <div data-testid={`cuisine-${cuisine.menu_name}`} className='cuisine-div' key={cuisine.menu_name} onClick={() => fetchCuisineItems(cuisine.menu_name)}>
                <img className={`${selectedCuisine === cuisine.menu_name ? "selected" : ""}`} src={cuisine.menu_image} alt={cuisine.menu_name} />
                <p>{cuisine.menu_name}</p>
            </div>
        ));
    }

    // Display food menu with Add/Increase/Decrease buttons
    const menuContainer = menu.map((item) => {
        const {_id} = item;
        const cartItem = itemsList.find(i => i._id === _id);

        return (
            <StyledCard key={_id} data-testid={`menu-item-${item._id}`}>
                <Card.Img variant="top" src={item.image}/>
                <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                    <Card.Subtitle>${item.price}</Card.Subtitle>
                    {cartItem && cartItem.quantity > 0 ? (
                        <div className='item-update'>
                            <button className='plus' data-testid={`plus-${item._id}`} onClick={() => increaseQuantity(_id)}>+</button>
                            <p data-testid={`quantity-${item._id}`}>{cartItem.quantity}</p>
                            <button className='minus' data-testid={`minus-${item._id}`} onClick={() => decreaseQuantity(_id)}>-</button>
                        </div>
                    ) : (
                        <button className='addToCart' onClick={() => increaseQuantity(_id)}>Add to Cart</button>
                    )}
                </Card.Body>
            </StyledCard>
        );
    });

    return (
        <>
            <Container>
                <Navbar/>
                {itemsList && (
                    <>
                        <div className='top-content'>
                            <img src={BackgroundFood} alt="food-item" />
                            <p className='heading line1'>Order your</p>
                            <p className='heading line2'>favourite food here</p>
                            <p className='description line1'>
                                Choose from a diverse menu featuring a delectable array of dishes with the finest
                            </p>
                            <p className='description line2'>
                                ingredients and culinary expertise. Our mission is to satisfy your cravings and elevate your
                            </p>
                            <p className='description line3'>
                                dining experience, one delicious meal at a time.
                            </p>
                            <AnchorLink href="#menu">
                                <button>View Menu</button>
                            </AnchorLink>
                        </div>
                        <p style={{marginTop: "2rem", fontSize: "1.5rem", fontWeight: "bold"}}>Explore Our Menu</p>
                        <p style={{marginTop: "1rem"}}>Choose from a diverse menu featuring a delectable array of dishes.</p>
                        <div className='cuisine-nav'>{displayCuisine()}</div>
                        {/* <hr style={{marginTop: "3rem", marginBottom: "0.5rem"}}/> */}
                        <section style={{marginTop: "3rem"}} id='menu' className='menu'>
                            {menuContainer}
                        </section>
                    </>
                )}
            </Container>
            <ToastContainer/>
        </>
    );
}

const StyledCard = styled(Card)`
    width: 18rem;
    border: none;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    &:hover
    {
        transform: translateY(-10px);
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
    }
    img
    {
        width: 100%;
        height: 12rem;
        object-fit: cover;
    }
    .card-body
    {
        padding: 1rem;
        text-align: left;
        .card-title
        {
            font-size: 1.25rem;
            font-weight: bold;
        }
        .card-text
        {
            font-size: 1rem;
            color: #555;
            margin: 0.5rem 0;
        }
        .card-subtitle
        {
            margin-bottom: 1rem;
            font-size: 1.2rem;
            font-weight: bold;
            color: #ff6b6b;
        }
        .addToCart
        {
            padding: 0.5rem;
            width: 60%;
            cursor: pointer;
        }
    }
    .item-update
    {
        display: flex;
        align-items: center;
        justify-content: space-between;
        button
        {
            height: 2rem;
            width: 2rem;
            border-radius: 1rem;
            cursor: pointer;
        }
    }
`;

const Container = styled.div`
    height: 100vh;
    width: 80vw;
    display: flex;
    flex-direction: column;

    margin: 0 10vw 0 10vw;

    .top-content
    {
        color: white;
        margin-top: 1rem;
        position: relative;
        text-align: center;
        img
        {
            width: 100%;
        }
        .heading
        {
            font-weight: bold;
            font-size: 4rem;
            position: absolute;
            left: 5rem;
            &.line1
            {
                top: 3rem;
            }
            &.line2
            {
                top: 8rem;
            }
        }
        .description
        {
            position: absolute;
            left: 5rem;
            &.line1
            {
                top: 18rem;
            }
            &.line2
            {
                top: 19rem;
            }
            &.line3
            {
                top: 20rem;
            }
        }
        button
        {
            position: absolute;
            left: 5rem;
            top: 25rem;
            padding: 1rem 2rem 1rem 2rem;
            border-radius: 5rem;
            border: none;
            cursor: pointer;
            &:hover
            {
                background-color: #dcdcdc;
            }
        }
    }
    .cuisine-nav
    {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        .cuisine-div
        {
            font-size: 1.2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            gap: 0.7rem;
            width: 100%;
            img
            {
                border: 1px solid transparent;
                width: 6rem;
                cursor: pointer;
                border-radius: 50%;
                transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                &:hover
                {
                    transform: scale(1.1); /* Scale up the image slightly */
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3); /* Add shadow effect */
                }
                &.selected
                {
                    border: 8px solid #00ffff;
                }
            }
        }
    }
    .menu
    {
        display: grid;
        grid-template-columns: auto auto auto auto;
        row-gap: 1rem;
    }
`;

export default HomePage;
