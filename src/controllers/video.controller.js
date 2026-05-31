import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { Video } from "../models/video.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import {v2 as cloudinary} from "cloudinary";

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
        videoFile: videoFile.url,
        videoFilePubId: videoFile.public_id,
        owner: req.user._id,
        title,
        description,
        duration: videoFile.duration,
        thumbnail: thumbnail.url,
        thumbnailPubId: thumbnail.public_id,
    })
    if(!video) throw new ApiError(500, "Something went wrong while uploading video!");

    res.status(201).json(new ApiResponse(200,video,"Video uploaded successfully"))
})

const getAllVideos = asyncHandler(async (req,res)=>{
    //  http//localhost:8000/api/videos?page=2&limit=5&query=react&sortBy=views&sortType=desc&userId=123
    const {page=1,limit=10,query,sortBy="createdAt",sortOrder="desc",userId} = req.query   // .query(string) comes from URL, use for search,filter,pagination etc 
    
    const filter = {};
    if(query && query.trim().length>0) filter.$text = {$search: query.trim()}   // set "$text" key in filter object 
    if(userId) filter.owner = userId

    const allowedSortFields = ["createdAt","views","likes"]
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"; // set "createdAt" as defalut

    let pageNo = Number(page);  // bcz req.query always gives string NOT number
    let limitNo = Number(limit);
    pageNo = pageNo<1 ? 1 : pageNo   // validations to set page & limit
    limitNo = limitNo<1 ? 1 : limitNo
    limitNo = limitNo>50 ? 50 : limitNo

    const allVideos = await Video
    .find(filter)
    .sort({            // .sort() mongodb style
        [sortField]: sortOrder==="desc" ? -1 : 1   // sortBy = views,createdAt,like fields etc | sortOrder = ascending(asc) /descending(desc)
    })
    .skip((pageNo-1)*limitNo)  // for pagination
    .limit(limitNo)

    const totalVideos = await Video.countDocuments(filter)
    const totalPages = Math.ceil(totalVideos/limitNo)

    res.status(200).json(new ApiResponse(200,{
        totalVideos,
        allVideos,
        currentPage: pageNo, 
        totalPages,
        limit: limitNo
    },"Videos are fetched successfully"))
})

const getVideoById = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const video = await Video.findById(videoId);
    if(!video) throw new ApiError(404,"Video does not found!");
    res.status(200).json(new ApiResponse(200,video,"Video fetched succesfully"))
})

const updateVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    const {title,description} = req.body;

    if(!videoId) throw new ApiError(400,"Video Id is required!")
    if(!title && !description) throw new ApiError(400, "At least one field is required!")
    
    const thumbnailPath = req.files?.thumbnail[0]?.path;
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    const updateFields = {}
    if(title) updateFields.title = title;
    if(description) updateFields.description = description;

    if (req.files?.thumbnail?.[0]?.path) {
        const thumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path)
        if (thumbnail) updateFields.thumbnail = thumbnail.url
    }

    const video = await Video.findByIdAndUpdate(videoId,updateFields,{new:true});
    if (!video) throw new ApiError(404, "Video not found!")
    res.status(200).json(new ApiResponse(200,video,"Video updated successfully"))
})

const deleteVideo = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    if (!videoId) throw new ApiError(400, "Video ID is required!");

    const video = await Video.findById(videoId);    // find video
    if(!video) throw new ApiError(404,"Video not found!")

    await cloudinary.uploader.destroy(video.videoFilePubId,{ // delete files from cloudinry using public_id
        resource_type: "video"
    })
    
    await cloudinary.uploader.destroy(video.thumbnailPubId,{
        resource_type: "image"
    })

    await video.deleteOne();  // delete from db
    res.status(200).json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishedStatus = asyncHandler(async (req,res)=>{
    const {videoId} = req.params;
    if (!videoId) throw new ApiError(400, "Video ID is required!");

    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(404,"Video not found!")

    video.isPublished = !video.isPublished;     // invert values
    await video.save()
    res.status(200).json(new ApiResponse(200,video,"Published Status is toggled"))
})

export{
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishedStatus
}
