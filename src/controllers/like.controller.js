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

const userId = req.user?._id;

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID format.");
  }

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

const togglePlaylistLike = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID.");
  }
  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) throw new ApiError(404, "Playlist not found.");

  const likedPlaylist = await Like.findOne({
    playlist: playlistId,
    owner: userId,
  });

  if (likedPlaylist) {
    await Like.findByIdAndDelete(likedPlaylist._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist disliked successfully."));
  }

  await Like.create({
    playlist: playlistId,
    likedBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist liked Successfully."));
});

const toggleBitLike = asyncHandler(async (req, res) => {
  const { bitId } = req.params;

  if (!isValidObjectId(bitId)) {
    throw new ApiError(400, "Invalid bit ID.");
  }
  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  const bit = await Bit.findById(bitId);

  if (!bit) throw new ApiError(404, "Bit not found.");

  const likedBit = await Like.findOne({
    bit: bitId,
    owner: userId,
  });

  if (likedBit) {
    await Like.findByIdAndDelete(likedBit._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Bit disliked successfully."));
  }

  await Like.create({
    bit: bitId,
    likedBy: userId,
  });

  return res.status(200).json(new ApiResponse(200, "Bit liked Successfully."));
});



export {
  toggleVideoLike,
  toggleCommentLike,
  togglePlaylistLike,
  toggleBitLike,
  getLikedVideos,
};
