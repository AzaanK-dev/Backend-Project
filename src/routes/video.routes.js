import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js"

const router = Router()
router.use(verifyJwt) // Apply verifyJWT to all routes in this file

router.route("/upload").post(upload.fields([
    {name:"videoFile", maxCount:1},
    {name:"thumbnail", maxCount:1}
]),uploadVideo)

router.route("/").get(getAllVideos)
router.route("/:videoId").get(validateObjectId("videoId"),getVideoById)

router.route("/video/:videoId")
.patch(validateObjectId("videoId"),updateVideo)
.delete(validateObjectId("videoId"),deleteVideo)


export default router;