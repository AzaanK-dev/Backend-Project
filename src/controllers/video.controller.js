import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { Video } from "../models/video.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

// https://github.com/hiteshchoudhary/chai-backend/blob/main/

const uploadVideo = asyncHandler(async (req,res)=>{
    const {title,description} = req.body
    if(!title.trim() || !description.trim()) throw new ApiError(400, "Required fields are empty!");
    
    const videoFilePath = req.files?.videoFile[0]?.path
    if(!videoFilePath) throw new ApiError(400, "Video File is required!");
    const videoFile = await uploadOnCloudinary(videoFilePath)
    if(!videoFile) throw new ApiError(400,"Video File is required!")

    const thumbnailPath = req.files?.thumbnail[0]?.path
    if(!thumbnailPath) throw new ApiError(400, "Thumbnail is required!");
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    if(!thumbnail) throw new ApiError(400,"Thumbnail is required!")

    const video = await Video.create({
        videoFile : videoFile.url,
        owner: req.user._id,
        title,
        description,
        duration : videoFile.duration,
        thumbnail: thumbnail.url,
    })
    if(!video) throw new ApiError(500, "Something went wrong while uploading video!");

    res.status(201).json(new ApiResponse(200,video,"Video uploaded successfully"))
})

const getAllVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId} = req.query   // .query comes from URL, use for video search,filter etc 
})

const getVideoById = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404,"Video does not found!");
    res.status(200).json(new ApiResponse(200,video,"Video fetched succesfully"))
})

export{
    uploadVideo,
    getVideoById
}