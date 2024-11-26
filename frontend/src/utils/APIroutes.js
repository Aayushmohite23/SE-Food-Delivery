const host = process.env.REACT_APP_API_URL || "https://se-food-delivery.onrender.com";

export const getMenu = `${host}/api/restaurant/getMenu`;
export const getCartItems = `${host}/api/restaurant/getCartItems`;
export const increaseCartItem = `${host}/api/restaurant/increaseCartItem`;
export const decreaseCartItem = `${host}/api/restaurant/decreaseCartItem`;
export const removeCartItem = `${host}/api/restaurant/removeCartItem`;
