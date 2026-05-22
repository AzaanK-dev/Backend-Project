import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const verifyJwt = asyncHandler(async (req,res,next)=>{    // for confirming that user is logged in
    try{
        // in case cookie is absent (as in mobile apps) use header syntax-> Authorization: bearer <token>
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ","")
        if(!token) throw new ApiError(401,"Unauthorized request!")
        
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")   
        if(!user) throw new ApiError(401,"Invalid access token!");

        req.user = user;  
        next();   // tell abput reference of next method
    }catch(error){
        throw new ApiError(401,error?.message||"Authorization failed due to invalid access token!")
    }
})

export { verifyJwt };