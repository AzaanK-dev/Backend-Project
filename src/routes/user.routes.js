import { Router } from "express";
import { changePassword, getChannel, getWatchHistory, loginUser, logoutUser, registerUser, renewAccessToken, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([     // file uploading through multer
        {name: "avatar",maxCount : 1},
        {name: "coverImage",maxCount : 1}
    ])
    ,registerUser)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJwt,logoutUser)
router.route("/refresh-token").post(renewAccessToken)

router.route("change-password").patch(verifyJwt,changePassword)    // patch -> to change only specific patch of details
router.route("update-account-details").patch(verifyJwt,updateAccountDetails)  

router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)  // upload middleware bcz file is required from user
router.route("/coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)

router.route("/channel/:username").get(verifyJwt,getChannel)    // bcz req.params is used in this function so data from link is required
router.route("/history").get(verifyJwt,getWatchHistory)     // get -> bcz no data from user is required

export default router;