import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  togglePlaylistLike,
  toggleBitLike,
  getLikedVideos
} from "../controllers/like.controller.js";

const likeRouter = Router();

likeRouter.route("/toggle-video-like/:videoId").post(verifyJWT, toggleVideoLike);
likeRouter.route("/toggle-comment-like/:commentId").post(verifyJWT, toggleCommentLike);
likeRouter.route("/toggle-playlist-like/:playlistId").post(verifyJWT, togglePlaylistLike);
likeRouter.route("/toggle-bit-like/:bitId").post(verifyJWT, toggleBitLike);
likeRouter.route("/liked-videos").get(verifyJWT, getLikedVideos);

export default likeRouter;