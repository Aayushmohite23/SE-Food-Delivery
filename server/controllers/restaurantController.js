import Menu from '../model/menuModel.js';
import Cart from '../model/cartModel.js';

export const getMenu = async (req, res, next) => {
    try
    {
        const {cuisine} = req.query;
        let foodItems;
        if(!cuisine) foodItems = await Menu.find({});
        else foodItems = await Menu.find({category: cuisine});

        if(!foodItems)
        {
            return res.json({status: false,  msg: 'Could not fetch menu right now. Please try again.'});
        }
        return res.json({status: true, menu: foodItems});
    }
    catch(error)
    {
        next(error);
    }
};

export const getCartItems = async (req, res, next) => {
    try
    {
        const cart = await Cart.find({});
        if(!cart)
        {
            return res.json({status: false,  msg: 'Could not fetch cart items right now. Please try again.'});
        }

        return res.json({status: true, cart});
    }
    catch(error)
    {
        next(error);
    }
};

export const increaseCartItem = async (req, res, next) => {
    try
    {
        const {id} = req.params;

        let cartItem = (await Cart.find({_id: id}))[0];

        if(!cartItem)
        {
            // If the cart item doesn't exist, create it
            cartItem = await Cart.create({_id: id, quantity: 1});
        }
        else
        {
            // If the cart item exists, update its quantity
            cartItem = await Cart.findOneAndUpdate(
                {_id: id},
                {$inc: {quantity: 1}}, // Increment the quantity by 1
                {new: true} // Return the updated document
            );
        }
        return res.json({status: true, cartItem});
    }
    catch(error)
    {
        next(error);
    }
};

export const decreaseCartItem = async (req, res, next) => {
    try
    {
        const {id} = req.params;
        let cartItem = (await Cart.find({_id: id}))[0];
        
        if(!cartItem)
        {
            return res.json({status: false, msg: 'Cart item not found.'});
        }
        else
        {
            if(cartItem.quantity === 1)
            {
                // If the quantity is 1, delete the cart item
                await Cart.findOneAndDelete({ _id: id});
            }
            else
            {
                // Otherwise, decrease the quantity by 1
                cartItem = await Cart.findOneAndUpdate(
                    {_id: id},
                    {$inc: {quantity: -1}}, // Decrement the quantity by 1
                    {new: true}
                );
            }
        }
        return res.json({status: true, cartItem});
    }
    catch(error)
    {
        next(error);
    }
};

export const removeCartItem = async (req, res, next) => {
    try
    {
        const {id} = req.params;
        const cartItem = await Cart.findOneAndDelete({_id: id});
        // if(cartItem.length === 0)
        if(!cartItem)
        {
            return res.status(404).json({status: false, msg: 'Cannot remove item from cart. Please try again.'});
        }
        return res.status(200).json({status: true});
    }
    catch(error)
    {
        next(error);
    }
};

// export {getMenu, getCartItems, increaseCartItem, decreaseCartItem, removeCartItem};