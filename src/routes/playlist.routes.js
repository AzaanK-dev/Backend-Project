import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();
router.use(verifyJwt); 

router.route("/").post(createPlaylist)

router.route("/:playlistId")
.get(validateObjectId("playlistId"),getPlaylistById)
.patch(validateObjectId("playlistId"),updatePlaylist)
.delete(validateObjectId("playlistId"),deletePlaylist);

router.route("/add/:videoId/:playlistId")
.patch(
    validateObjectId("videoId"),
    validateObjectId("playlistId"),
    addVideoToPlaylist
);

router.route("/remove/:videoId/:playlistId")
.patch(
    validateObjectId("videoId"),
    validateObjectId("playlistId"),
    removeVideoFromPlaylist
);

router.route("/user/:userId").get(validateObjectId("userId"),getUserPlaylists);

export default router