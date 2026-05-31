import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getUserTweets = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.query

    let pageNo = Number(page)
    let limitNo = Number(limit)
    pageNo = pageNo<1 ? 1 : pageNo   
    limitNo = limitNo<1 ? 1 : limitNo
    limitNo = limitNo>50 ? 50 : limitNo

    const userTweets = await Tweet
    .find({owner: req.user._id})
    .skip((pageNo-1)*limitNo)
    .limit(limitNo)

    return res.status(200).json(new ApiResponse(200,{userTweets,currentPage: pageNo,limit: limitNo},"UserTweets are fetched successfully"))
})

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content?.trim()) throw new ApiError(400,"Content is required!")
    
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    if(!tweet) throw new ApiError(500,"Something went wrong while creating tweet!")
    
    return res.status(201).json(new ApiResponse(201,tweet,"Tweet added successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body
    if(!content?.trim()) throw new ApiError(400,"Content is required!")

    const tweet = await Tweet.findByIdAndUpdate(tweetId,{content},{new:true})
    if(!tweet) throw new ApiError(404,"Tweet not found!")

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if(!tweet) throw new ApiError(404,"Tweet not found!")
    return res.status(200).json(new ApiResponse(200,{},"Tweet deleted successfully"))
})

export {
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet
}