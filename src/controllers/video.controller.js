import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Category } from "../models/category.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  let { playlist, category } = req.body;

  if (!title || !description || !playlist || !category) {
    throw new ApiError(400, "All fields are required.");
  }

  if (title?.trim() == "") throw new ApiError(400, "Title must not be empty.");

  // Find category or create it if doesn't exist
  let categoryName = await Category.findOne({ name: category.trim() });
  if (!categoryName) {
    category = await Category.create({ name: category.trim() });
  } else {
    throw new ApiError(403, "Category already exists.");
  }

  // Find playlist or create it if doesn't exist
  let playlistName = await Playlist.findOne({ title: playlist.trim() });
  if (!playlistName) {
    playlist = await Playlist.create({ title: playlist.trim() });
  } else {
    throw new ApiError(403, "Playlist already exists.");
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "The video is required to be selected.");
  }

  const videoUploaded = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUploaded = thumbnailLocalPath
    ? await uploadOnCloudinary(thumbnailLocalPath)
    : null;

  if (!videoUploaded) {
    throw new ApiError(500, "Video upload failed, please retry.");
  }

  const userId = req.user?._id;

  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  const user = await User.findById(userId).select("username");
  const owner = user?.username;

  const video = await Video.create({
    title: title,
    description: description,
    owner: userId,
    duration: videoUploaded?.duration || null,
    playlist: playlist._id,
    category: category._id,
    isPublished: isPublished,
    videoFile: videoUploaded?.url,
    thumbnail: thumbnailUploaded?.secure_url || thumbnailUploaded?.url || "",
  });

  const videoDetails = await Video.findById(video._id)
    .populate("owner", "username fullName")
    .populate("playlist", "title description")
    .populate("category", "name");

  if (!videoDetails) {
    throw new ApiError(500, "Something went wrong while saving the video.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: videoDetails },
        "Video uploaded successfully."
      )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
