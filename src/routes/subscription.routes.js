import { Router } from 'express';
import {
    getChannelSubscribers,
    getSubscribedChannels,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();
router.use(verifyJwt);

router.route("/channel/:channelId")
.get(validateObjectId("channelId"),getChannelSubscribers)
.post(validateObjectId("channelId"),toggleSubscription);

router.route("/users/:subscriberId/subscriptions").get(validateObjectId("subscriberId"),getSubscribedChannels);

export default router