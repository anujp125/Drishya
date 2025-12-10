import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Bit } from "../models/bit.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format.");
  }

  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }
  const likedVideo = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Video disliked successfully."));
  }
  await Like.create({
    video: videoId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video liked Successfully."));
});

export {
  toggleVideoLike,
  toggleCommentLike,
  togglePlaylistLike,
  toggleBitLike,
  getLikedVideos,
};
