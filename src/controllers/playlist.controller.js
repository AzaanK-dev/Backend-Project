import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import ApiResponse from "../utils/ApiResponse.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name) throw new ApiError(400,"Name is required!")
    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user._id,
        videos: []   // empty plalist initially
    })
    res.status(201).json(new ApiResponse(201,playlist,"Playlist created successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId) throw new ApiError(400,"Required fields are empty!")
        
    const video = await Video.findById(videoId)
    if(!video) throw new ApiError(404,"Video not found!")
    
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $addToSet: {videos: videoId}  // add video ID to videos[], doesnot allow duplicate video
    },{new:true})

    if(!playlist) throw new ApiError(404, "Playlist not found!")
    res.status(200).json(new ApiResponse(200,playlist,"Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId || !videoId) throw new ApiError(400,"Required fields are empty!")
    
    const playlist = await Playlist.findByIdAndUpdate(playlistId,{
        $pull: {videos: videoId}  // remove video ID from videos[]
    },{new:true})

    if(!playlist) throw new ApiError(404, "Playlist not found!")
    res.status(200).json(new ApiResponse(200,playlist,"Video removed from playlist successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!playlistId) throw new ApiError(400,"Playlist ID is required!")
    if (!name && !description) throw new ApiError(400, "At least one field is required!")
    
    const updateFields = {}
    if (name) updateFields.name = name
    if(description) updateFields.description = description

    const playlist = await Playlist.findByIdAndUpdate(playlistId,updateFields,{new:true})
    if(!playlist) throw new ApiError(404, "Playlist not found!")
    
    res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId) throw new ApiError(400,"Playlist ID is required!")

    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if(!playlist) throw new ApiError(404, "Playlist not found!")
    res.status(200).json(new ApiResponse(200,{},"Playlist deleted successfully"))
})