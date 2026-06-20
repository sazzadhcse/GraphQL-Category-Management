import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        const db_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gql-category1';
        await mongoose.connect(db_uri);
        console.log("Mongodb is connected");
        
    }
    catch(error){
        console.error("Mongodb connection error",error);
    }
}

export default connectDB;