process.env.NODE_ENV = 'test';

// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

import { use, expect } from 'chai'
import chaiHttp from 'chai-http'
const chai = use(chaiHttp)
import mongoose from 'mongoose';
import app from '../index.js'; // Import your Express app as an ES module
import Cart from '../model/cartModel.js';
import Menu from '../model/menuModel.js';

// const { expect } = chai;
// chai.use(chaiHttp);

chai.request.execute();

// before(async () => {
//   await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
// });


// Clear database after each test to maintain isolation
afterEach(async () => {
  await Cart.deleteMany({});
  await Menu.deleteMany({});
});

// Close database connection after all tests
after((done) => {
  mongoose.connection.close(() => done());
});

describe('Restaurant Controller', () => {

  // Test for GET /api/restaurant/getMenu
  describe('GET /api/restaurant/getMenu', () => {
    it('should fetch all menu items', async () => {
      const menuItems = [
        { name: 'Greek Salad', image: 'image1.jpg', price: 5, description: 'Fresh Greek salad', category: 'Salad' },
        { name: 'Spring Rolls', image: 'image2.jpg', price: 6, description: 'Crispy rolls with veggies', category: 'Rolls' },
        { name: 'Chocolate Lava Cake', image: 'image3.jpg', price: 4, description: 'Molten chocolate cake', category: 'Desserts' },
        { name: 'Club Sandwich', image: 'image4.jpg', price: 7, description: 'Classic club sandwich', category: 'Sandwich' },
        { name: 'Vanilla Sponge Cake', image: 'image5.jpg', price: 8, description: 'Soft sponge cake', category: 'Cake' },
        { name: 'Veggie Delight', image: 'image6.jpg', price: 10, description: 'All-veggie platter', category: 'Pure Veg' },
        { name: 'Alfredo Pasta', image: 'image7.jpg', price: 9, description: 'Creamy alfredo pasta', category: 'Pasta' },
        { name: 'Hakka Noodles', image: 'image8.jpg', price: 11, description: 'Spicy Hakka noodles', category: 'Noodles' },
      ];
      await Menu.insertMany(menuItems);

      const res = await chai.request.execute(app).get('/api/restaurant/getMenu');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.menu).to.be.an('array').that.has.lengthOf(menuItems.length);
    });

    it('should fetch menu items by cuisine category', async () => {
      await Menu.create({ name: 'Greek Salad', image: 'image1.jpg', price: 5, description: 'Fresh Greek salad', category: 'Salad' });
      await Menu.create({ name: 'Vanilla Sponge Cake', image: 'image5.jpg', price: 8, description: 'Soft sponge cake', category: 'Cake' });

      const res = await chai.request.execute(app).get('/api/restaurant/getMenu').query({ cuisine: 'Salad' });
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.menu).to.be.an('array').with.lengthOf(1);
      expect(res.body.menu[0]).to.have.property('category', 'Salad');
    });
  });

  // Test for GET /api/restaurant/getCartItems
  describe('GET /api/restaurant/getCartItems', () => {
    it('should fetch all cart items', async () => {
      await Cart.create({ _id: new mongoose.Types.ObjectId(), quantity: 2 });

      const res = await chai.request.execute(app).get('/api/restaurant/getCartItems');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.cart).to.be.an('array').that.has.lengthOf(1);
    });

    it('should return an empty cart when there are no items', async () => {
      const res = await chai.request.execute(app).get('/api/restaurant/getCartItems');
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.cart).to.be.an('array').that.is.empty;
    });
  });

  // Test for PATCH /api/restaurant/increaseCartItem/:id
  describe('PATCH /api/restaurant/increaseCartItem/:id', () => {
    it('should increase quantity of an existing cart item', async () => {
      const item = await Cart.create({ _id: new mongoose.Types.ObjectId(), quantity: 1 });

      const res = await chai.request.execute(app).patch(`/api/restaurant/increaseCartItem/${item._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.cartItem).to.have.property('quantity', 2);
    });

    it('should create a new cart item if not exists and set quantity to 1', async () => {
      const itemId = new mongoose.Types.ObjectId();

      const res = await chai.request.execute(app).patch(`/api/restaurant/increaseCartItem/${itemId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.cartItem).to.have.property('quantity', 1);
    });
  });

  // Test for PATCH /api/restaurant/decreaseCartItem/:id
  describe('PATCH /api/restaurant/decreaseCartItem/:id', () => {
    it('should decrease quantity of an existing cart item', async () => {
      const item = await Cart.create({ _id: new mongoose.Types.ObjectId(), quantity: 2 });

      const res = await chai.request.execute(app).patch(`/api/restaurant/decreaseCartItem/${item._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
      expect(res.body.cartItem).to.have.property('quantity', 1);
    });

    it('should delete the cart item if quantity is 1', async () => {
      const item = await Cart.create({ _id: new mongoose.Types.ObjectId(), quantity: 1 });

      const res = await chai.request.execute(app).patch(`/api/restaurant/decreaseCartItem/${item._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
    });

    it('should return an error if cart item is not found', async () => {
      const itemId = new mongoose.Types.ObjectId();

      const res = await chai.request.execute(app).patch(`/api/restaurant/decreaseCartItem/${itemId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', false);
      expect(res.body).to.have.property('msg', 'Cart item not found.');
    });
  });

  // Test for DELETE /api/restaurant/removeCartItem/:id
  describe('DELETE /api/restaurant/removeCartItem/:id', () => {
    it('should remove the cart item by ID', async () => {
      const item = await Cart.create({ _id: new mongoose.Types.ObjectId(), quantity: 1 });

      const res = await chai.request.execute(app).delete(`/api/restaurant/removeCartItem/${item._id}`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('status', true);
    });

    it('should return an error if cart item is not found', async () => {
      const itemId = new mongoose.Types.ObjectId();

      const res = await chai.request.execute(app).delete(`/api/restaurant/removeCartItem/${itemId}`);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property('status', false);
      expect(res.body).to.have.property('msg', 'Cannot remove item from cart. Please try again.');
    });
  });
});


// process.env.NODE_ENV = 'test';

// const chai = require("fix-esm").require('chai');
// const expect = chai.expect;

// describe('/First Test', function() {
//     it('Describe 2 values', function() {
//         // crfc
//     })
// })

