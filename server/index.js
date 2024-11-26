import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db/connect.js';
import restaurantRoutes from './routes/restaurantRoutes.js';



const app = express();

app.use(cors());
const port = process.env.PORT || 3000;

const allowedOrigins = ['https://se-food-delivery.vercel.app/'];

app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,POST,PUT,DELETE,PATCH',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({limit: '50mb'}));
// app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use('/api/restaurant', restaurantRoutes);

const start = async () => {
    try
    {
        await connectDB();
        app.listen(port, () => console.log(`Server is listening on ${port}`));
    }
    catch(error)
    {
        console.log(error);
    }
};
start();

export default app;
