// require('dotenv').config({path:"./.env"})

import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

console.log("MONGODB_URI:", process.env.MONGODB_URI);

dotenv.config({     // setup for .env files
    path:'./.env'
})

connectDB();




// "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
// "dev": "nodemon -r dotenv/config src/index.js"