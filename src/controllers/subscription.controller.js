import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import mongoose from "mongoose"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribed = await Subscription.findOneAndDelete({channel: channelId,subscriber: req.user._id})  // find subscription document and delete it filterd for channel
    if(!subscribed){                  // if not found ,then create it    
        await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
    }
    return res.status(200).json(new ApiResponse(200,{},"Subscription Status is toggled"))   
})

const getChannelSubscribers = asyncHandler(async (req, res) => {  // return subscriber list of a channel
    const {channelId} = req.params
    // const subscribers = await Subscription.find({channel: channelId})   // just return subscriber ids
    if(!await User.findById(channelId)) throw new ApiError(404,"Channel not found!")

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {   // fetching subcriber details
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {  // converting "subscriber" array to object
            $unwind: "$subscriber"  
        },
        {
            $project: {
                _id: 0,
                username: "$subscriber.username",
                avatar: "$subscriber.avatar"
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscribers,"Channel Subscribers are fetched successfully"))   
})

const getSubscribedChannels = asyncHandler(async (req, res) => {    // return channel list to which user has subscribed
    const { subscriberId } = req.params
    if(!await User.findById(subscriberId)) throw new ApiError(404,"Subscriber not found!")

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"  
        },
        {
            $project: {
                _id: 0,
                username: "$channel.username",
                avatar: "$channel.avatar"
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,subscribedChannels,"Subscribed Channels are fetched successfully"))   
})

export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannels
}