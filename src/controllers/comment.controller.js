import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId) throw new ApiError(400,"Required fields are empty!")

    let pageNo = Number(page)
    let limitNo = Number(limit)
    pageNo = pageNo<1 ? 1 : pageNo   
    limitNo = limitNo<1 ? 1 : limitNo
    limitNo = limitNo>50 ? 50 : limitNo

    const videoComments = await Comment
    .find({video: videoId})
    .skip((pageNo-1)*limitNo)
    .limit(limitNo)

    return res.status(200).json(new ApiResponse(200,{videoComments,currentPage: pageNo,limit: limitNo},"VideoComments are fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    if(!videoId || !content) throw new ApiError(400,"Required fields are empty!")

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })
    if(!comment) throw new ApiError(500,"Something went wrong while adding comment!")

    return res.status(201).json(new ApiResponse(201,comment,"Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    if(!commentId || !content?.trim()) throw new ApiError(400,"Required fields are empty!")

    const comment = await Comment.findByIdAndUpdate(commentId,{content},{new:true})
    if(!comment) throw new ApiError(404,"Comment not found!")

    return res.status(200).json(new ApiResponse(200,comment,"Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if(!commentId) throw new ApiError(400,"Required fields are empty!")

    const comment = await Comment.findByIdAndDelete(commentId)
    if(!comment) throw new ApiError(404,"Comment not found!")
    return res.status(200).json(new ApiResponse(200,{},"Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}