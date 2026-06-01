import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
} from "../controllers/dashboard.controller.js"
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

router.use(verifyJwt); 

router.route("/stats/:channelId").get(validateObjectId("channelId"),getChannelStats);
router.route("/videos/:channelId").get(validateObjectId("channelId"),getChannelVideos);

export default router;