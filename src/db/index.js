import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"
import dns from "dns";

dns.setServers(["1.1.1.1","8.8.8.8"])

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`, {
            dbName: DB_NAME,
        });
        console.log(`\nMongoDB Connected at host: ${connectionInstance.connection.host}`);  // just to keep in touch of which host it is connecting
    } catch (error) {
        console.log("MongoDB Connection ERROR ", error);
        process.exit(1)
    }
}