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
    console.log(email);
    
    if([username,email,fullName,password].some(field => field?.trim() === "" )){   
        throw new ApiError(400,"Required fields are empty!")      // .some() checks whether any elemnet from array performs the function(test) assigned to it. if 1 true all true..
    }

    const existedUser = User.find({  // find the same user in database
        $or: [{username} , {email}]  // username || email
    })
    if(existedUser)  throw new ApiError(409,"User already exists with same email or username!")   

    const avatarLocalPath = req.files?.avatar[0]?.path              // avatar[0] gives object, .path give path of that object
    const coverImageLocalPath = req.files?.coverImage[0]?.path        // '?' check optionally value preent or not 
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

export default registerUser;