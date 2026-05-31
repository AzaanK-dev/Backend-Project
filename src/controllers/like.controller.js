import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    if (!videoId) throw new ApiError(400, "Video ID is required!");
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Video ID is invalid!");

    const liked = await Like.findOneAndDelete({video: videoId,likedBy: req.user._id})  // find like document and delete it filterd for video only
    if(!liked){                  // if not found ,then create it    
        await Like.create({
            video:videoId,
            likedBy: req.user._id
        })
    }
    return res.status(200).json(new ApiResponse(200,{},"VideoLiked Status is toggled"))  
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if (!commentId) throw new ApiError(400, "Comment ID is required!");
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Comment ID is invalid!");

    const liked = await Like.findOneAndDelete({comment: commentId,likedBy: req.user._id})
    if(!liked){                               // else , create it    
        await Like.create({
            comment:commentId,
            likedBy: req.user._id
        })
    }
    return res.status(200).json(new ApiResponse(200,{},"CommentLiked Status is toggled"))  
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;
    if (!tweetId) throw new ApiError(400, "Tweet ID is required!");
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Tweet ID is invalid!");

    const liked = await Like.findOneAndDelete({tweet: tweetId,likedBy: req.user._id})
    if(!liked){                               // else , create it    
        await Like.create({
            tweet:tweetId,
            likedBy: req.user._id
        })
    }
    return res.status(200).json(new ApiResponse(200,{},"TweetLiked Status is toggled"))  
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like
    .find({likedBy: req.user._id})  // filter by current user
    .populate("video")  // replaces the video ObjectId in Like with the full Video object
    .select("video")  // for cleaner response select only videos
    return res.status(200).json(new ApiResponse(200,likedVideos,"Liked videos are fetched successfully"))  
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}