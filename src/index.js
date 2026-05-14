// require('dotenv').config({path:"./.env"})
import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({     // setup for .env files
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at: ${process.env.PORT}`);
    })
})
.catch((err)=>console.log("Connection Failed!",err))




// "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
// "dev": "nodemon -r dotenv/config src/index.js"