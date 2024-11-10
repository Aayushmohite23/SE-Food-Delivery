import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    }
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;