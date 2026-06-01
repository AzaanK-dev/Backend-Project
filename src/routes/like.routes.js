import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();
router.use(verifyJwt); 

router.route("/toggle/video/:videoId").post(validateObjectId("videoId"),toggleVideoLike);
router.route("/toggle/comment/:commentId").post(validateObjectId("commentId"),toggleCommentLike);
router.route("/toggle/tweet/:tweetId").post(validateObjectId("tweetId"),toggleTweetLike);
router.route("/videos").get(getLikedVideos);

export default router