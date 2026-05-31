import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getVideoById, updateVideo, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyJwt) // Apply verifyJWT to all routes in this file

router.route("/upload").post(upload.fields([
    {name:"videoFile", maxCount:1},
    {name:"thumbnail", maxCount:1}
]),  uploadVideo)

router.route("/:videoId").get(getVideoById)
router.route("/update/:videoId").patch(updateVideo)
router.route("/delete/:videoId").get(deleteVideo)


export default router