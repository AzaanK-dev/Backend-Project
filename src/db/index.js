import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dns from "dns";

dns.setServers(["1.1.1.1","8.8.8.8"])

export const connectDB = async () => {
    try {
        console.log("🔥 connectDB function called");
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 5000
        });
        console.log(`\nMongoDB Connected at host: ${connectionInstance.connection.host}`);  // just to keep in touch of which host it is connecting
    } catch (error) {
        console.log("MongoDB Connection ERROR ", error);
        process.exit(1)
    }
}
// import mongoose from "mongoose"
// import { DB_NAME } from "../constants.js"

// export const connectDB = async ()=>{
//     try{
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\nMongoDB Connected at host: ${connectionInstance.connection.host}`);  // just to keep in touch of which host it is connecting
//     }catch(error){
//         console.log("MongoDB Connection ERROR ",error);
//         process.exit(1)
//     }
// }