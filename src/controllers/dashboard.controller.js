import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})

    const videoStats = await Video.aggregate([
        {  // fetching videos with this channel id
            $match:{
                owner: channelId
            }
        },
        {  // for fetching likes from this channel videos
            $lookup:{ 
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {  
            $group:{
                _id: null,  // compulsory for $group
                totalVideos: {$sum: 1},  // increment 1 for each video document
                totalViews: {$sum: "$views"},  // summing views from each 'video'
                totalLikes: {$sum: {$size: "$likes"}}  // summing likes from 'likes' array in each video 
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,{
        totalSubscribers,                   // '...' spread operator copies properties from one object into another
        ...(videoStats[0] || {totalVideos: 0,totalViews: 0,totalLikes: 0})  // '()' are used fro operator precendence
    },"Channel stats are fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const channelVideos = await Video.find({owner:channelId})
    return res.status(200).json(new ApiResponse(200,channelVideos,"Channel Videos are fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}