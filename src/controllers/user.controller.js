import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import ApiResponse from "../utils/ApiResponse.js"

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

    const avatarLocalPath = req.files?.avatar[0]?.path              // avatar[0] gives object, .path give path of that object, '?' check optionally value present or not 
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path        // X throws error 

    let coverImageLocalPath;         // only assign value to coverImageLocalPath if it satisfy condition else keep it empty
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath) throw new ApiError(400,"Avatar is required!")    

    const avatar = await uploadOnCloudinary(avatarLocalPath);      // uploading on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar) throw new ApiError(400,"Avatar is required!")      

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
        new ApiResponse(200,createdUser,"User registered successfully! ")
    )
})

const generateAccessAndRefreshTokens = async (userId)=>{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave: false})  // 'validateBeforeSave: false' bcz only .save() will expect ALL keys even which we keep hidden by ourselves
    return {accessToken,refreshToken};
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

    const cookieOptions = {       // for setting cookies to only modifiable from server (NOT frontend) 
        httpOnly: true,
        secure: true
    }

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
    
    const cookieOptions = {     
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",cookieOptions)  // deleting Cookie
    .clearCookie("refreshToken",cookieOptions)  
    .json(
        new ApiResponse(200,{},"User logged out successfully!") 
    )
})

export { registerUser,loginUser,logoutUser };