import mongoose from 'mongoose';

const connectDB = () => {
    const dbUri =  process.env.MONGO_URI;
    return mongoose.connect(dbUri)
                .then(()=>{
                    console.log("Connected to MongoDB!");
                })
                .catch(()=>{
                    console.log("Connection failed");
                });
};

export default connectDB;