import express from "express"
const router = express.Router();
import {getMenu, getCartItems, increaseCartItem, decreaseCartItem, removeCartItem} from '../controllers/restaurantController.js';

router.get('/getMenu', getMenu);
router.get('/getCartItems', getCartItems);
router.patch('/increaseCartItem/:id', increaseCartItem);
router.patch('/decreaseCartItem/:id', decreaseCartItem);
router.delete('/removeCartItem/:id', removeCartItem);

export default router;