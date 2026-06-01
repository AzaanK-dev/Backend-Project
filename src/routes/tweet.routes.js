import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();
router.use(verifyJwt); 

router.route("/").post(createTweet);
router.route("/user/:userId").get(validateObjectId("userId"),getUserTweets);
router.route("/:tweetId").patch(validateObjectId("tweetId"),updateTweet).delete(validateObjectId("tweetId"),deleteTweet);

export default router;