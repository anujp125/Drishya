import Router from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  publishVideo,
  deleteVideo,
  getAllVideos,
  getVideoById,
  incrementViewCount,
  updateVideoDetails,
} from "../controllers/video.controller.js";
// Create a new Express Router instance
const videoRouter = Router();

videoRouter.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
videoRouter.route("/fetch-videos").get(getAllVideos);
videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .delete(verifyJWT, deleteVideo)
  .put(verifyJWT, upload.single("thumbnail"), updateVideoDetails);
videoRouter.route("/increment-view/:videoId").post(incrementViewCount);



export default videoRouter;
