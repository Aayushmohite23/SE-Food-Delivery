import mongoose from 'mongoose';

const connectDB = () => {
    const dbUri = process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST  // Ensure this variable is in your .env.test file
    : process.env.MONGO_URI;
    return mongoose.connect(dbUri);
};

export default connectDB;