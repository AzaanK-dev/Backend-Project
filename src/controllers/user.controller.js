import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const registerUser = asyncHandler(async (req,res)=>{
    // getting all detailos from frontend / postman
    // checking whether all fields are empty or not
    // checking already existed user 
    // check for files i.e, avatar in local storage
    // check for files i.e, avatar on cloudinary
    // creating user object in database
    // removing password & refreshToken from 'user' for security
    // check for user creation
    // return res

    const {username,email,fullName,password} = req.body  
    
    if([username,email,fullName,password].some(field => field?.trim() === "" )){   
        throw new ApiError(400,"Required fields are empty!")      // .some() checks whether any elemnet from array performs the function(test) assigned to it. if 1 true all true..
    }
    
    
    const existedUser = await User.findOne({  // find the same user in database... findOne returns only a single object while find returns array
        $or: [{username} , {email}]  // username || email
    })
    if(existedUser) throw new ApiError(409,"User already exists with same email or username!")   

    const avatarLocalPath = req.files?.avatar[0]?.path           // avatar[0] gives object, .path give path of that object, '?' check optionally value present or not 
    if(!avatarLocalPath) throw new ApiError(400,"Avatar is required!");   

    const avatar = await uploadOnCloudinary(avatarLocalPath);      // uploading on cloudinary
    if(!avatar) throw new ApiError(400,"Avatar is required!")      
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path        // X throws error 

    let coverImageLocalPath;         // only assign value to coverImageLocalPath if it satisfy condition else keep it empty
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({               
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if(!createdUser) throw new ApiError(500,"Something went wrong while creating user!");

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully! ")
    )
})

const generateAccessAndRefreshTokens = async (userId)=>{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false})  // 'validateBeforeSave: false' bcz only .save() will expect ALL keys even which we keep hidden by ourselves
    return {accessToken,refreshToken};
}

const cookieOptions = {     // for setting cookies to only modifiable from server (NOT frontend)     
    httpOnly: true,
    secure: true
}

const loginUser = asyncHandler(async (req,res)=>{
    // getting username || email, password from user
    // find user in db
    // password check
    // access refresh token
    // send tokens in cookie

    const {username,email,password} = req.body
    if(!(username || email)) throw new ApiError(400,"Username or email are required!");

    const userFound = await User.findOne({
        $or: [{username},{email}]
    })
    if(!userFound) throw new ApiError(404,"User does not exists!");
    
    const validPassword = userFound.isPasswordCorrect(password);
    if(!validPassword) throw new ApiError(401,"Invalid User Credentials!");

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(userFound._id)
    const loggedUser = await User.findById(userFound._id).select("-password -refreshToken")   // remove password refreshToken from user->db

    return res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)  // setting Cookie
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(200,{user: loggedUser,accessToken,refreshToken},"User logged in successfully!") 
    )     // giving access & refresh tokens in data also bcz it is possinle that user wants to save them, or in mobile app we cant use cookie
    
})

const logoutUser = asyncHandler(async (req,res)=>{
    // req.user is accesible bcz of auth.middleware (which tells user is authenticated/logged in)
    User.findByIdAndUpdate(req.user._id,{ refreshToken: undefined},{new: true})  // for 1.finding user, 2.delete refreshToken for logout
    
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)  // deleting Cookie
    .clearCookie("refreshToken",cookieOptions)  
    .json(
        new ApiResponse(200,{},"User logged out successfully!") 
    )
})

const renewAccessToken = asyncHandler(async (req,res)=>{   // endpoint for refreshing both tokens after accessToken expires
    try{
        const token = req.cookies.refreshToken || req.body.refreshToken
        if(!token) throw new ApiError(401,"Unauthorized request!")
        
        const decodedToken = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user) throw new ApiError(401,"Invalid refresh token!");

        if(token != user.refreshToken) throw new ApiError(401,"Refresh token is expired or used!");

        const {accessToken,refreshToken: newRefreshToken} = await generateAccessAndRefreshTokens(user._id);

        res.status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",newRefreshToken,cookieOptions)
        .json(
            new ApiResponse(200, {accessToken,refreshToken: newRefreshToken}, "Tokens are renewed")
        )
    }catch(error){
        throw new ApiError(401,error?.message || "Invlid refresh token!")
    }

})

// update account details
const changePassword = asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword} = req.body;     // taking both from frontend
    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) throw new ApiError(400,"Old Password is incorrect!")

    user.password = newPassword;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password is changed"))
})

const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {newEmail,newFullName} = req.body
    if(!newEmail && !newFullName) throw new ApiError(400, "At least one field is required!")

    const updateFields = {}  
    if(newEmail) updateFields.email = newEmail;  // update email only if provided else keep old one
    if(newFullName) updateFields.fullName = newFullName;  // update fullname only if provided
    
    const user = await User
    .findByIdAndUpdate(req.user._id, updateFields, {new: true})
    .select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200,{},"Account details are updated"))
})

const updateAvatar = asyncHandler(async (req,res)=>{
    const newAvatarPath = req.files?.avatar[0].path
    if(!newAvatarPath) throw new ApiError(400,"Avatar is required!")
        
    const newAvatar = await uploadOnCloudinary(newAvatarPath);
    if(!newAvatar) throw new ApiError(401,"Something went wrong while uploading avatar!")

    const user = await User
    .findByIdAndUpdate(req.user._id,{ avatar: newAvatar.url },{new: true})
    .select("-password -refreshToken")
    
    return res.status(200).json(new ApiResponse(200,{},"Avatar is updated"))
})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const newCoverImagePath = req.files?.coverImage[0].path
    if(!newCoverImagePath) throw new ApiError(400,"CoverImage is required!") // just bcz we specifically call this method.. OTHERISE cover image is NOT COMPULSORY
    const newCoverImage = await uploadOnCloudinary(newCoverImagePath);
    if(!newCoverImage) throw new ApiError(401,"Something went wrong while uploading coverImage!")

    const user = await User
    .findByIdAndUpdate(req.user._id,{ coverImage: newCoverImage.url },{new: true})
    .select("-password -refreshToken")
    
    return res.status(200).json(new ApiResponse(200,{},"Cover image is updated"))
})

const getChannel = asyncHandler(async (req,res)=>{
    const {username} = req.params  // channnel name from link
    if(!username) throw new ApiError(400,"Username is missing!")

    // aggregation pipelines (stages that process documents)
    const channel = await User.aggregate([
        {   // gets user(channel) whose username matches
            $match: {       
                username: username.toLowerCase()  
            }
        },
        {   // Fetch all users who subscribed to this channel (followers)
            $lookup: {      
                from: "subscriptions",  // 'Subscription' model written as 'subscriptions' in DB
                localField: "_id",
                foreignField: "channel",  // Find all subscriptions where this user is the channel
                as: "subscribers"
            }
        },
        {   // Fetch all users whom this channel has subscribed to (following)
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber", // find all subscriptions where this user is subscriber
                as: "subscribedTo"
            }
        },
        {   // add these extra feilds in 'User' model
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {         // chechk current user has subscribed this channel or not
                    $cond: {        // just like if/else
                        if: {$in: [req.user._id, "$subscribers.subscriber"]},  
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   // only set selected fields from 'User' to "Channel" 
            $project: {
                username: 1,    // to select just set flagged 1
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length) throw new ApiError(404,"Channel does not exists!")

    return res.status(200).json(new ApiResponse(200,channel[0],"Channel data fetched successfully"))
})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id) // converting _id string into object using mongoose and then comparing with _id
            }
        },
        {   // fetch _id of videos as watchHistory 
            $lookup: {  
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [     // nested pipeline for fetching owner of each video bcz in videos it is from user model (check video model)
                    {       
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {       // to get selected fields only
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                },
                                {
                                    $addFields: { 
                                        owner: {
                                            $first: "$owner"  // Converts owner array into a single object.  
                                        }
                                    }   
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch history is fetched successfully"))
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    renewAccessToken,
    
    changePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,

    getChannel,
    getWatchHistory,
};