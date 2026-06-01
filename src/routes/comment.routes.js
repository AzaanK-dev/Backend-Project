import { Router } from "express";
import { validateObjectId } from "../middlewares/validateObjectId.middleware.js"
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router()
router.use(verifyJwt)

router.route("/:videoId")  // more ideal way
.get(validateObjectId("videoId"),getVideoComments)
.post(validateObjectId("videoId"),addComment)

router.route("/comment/:commentId")
.delete(validateObjectId("commentId"),deleteComment)  
.patch(validateObjectId("commentId"),updateComment); 

// router.route("/update/:commentId").patch(validateObjectId(commentId),updateComment)
// router.route("/delete/:commentId").delete(validateObjectId(commentId),deleteComment)

export default router;