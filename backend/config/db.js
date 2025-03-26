import mongoose from "mongoose";
const connectDB = async()=>{
    try{
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL);
        console.log("MONGODB connected!")
    }catch(err){
        console.log("DB connection error",err)
    }
}

export default connectDB;