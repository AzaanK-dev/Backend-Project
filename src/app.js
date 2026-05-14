import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"})); // configuration limit for amount of data from json (forms)
app.use(express.urlencoded({extended: true, limit:"16kb"}))  // configuration for data from URL (links)
app.use(express.static("public"))  // configuration for assets, images,icons etc in 'public' folder
app.use(cookieParser())  // config for cookies in browser

export default app;
