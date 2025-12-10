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
  // Extract query parameters
  const {
    page = 1,
    limit = 10,
    query,
    sortBy,
    sortType,
    userId,
    playlistId,
    categoryId,
  } = req.query;

  // Step 1: Build filter object
  const filter = {};

  // Search by title or description (case-insensitive)
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter by specific user (if valid ObjectId)
  if (userId && mongoose.isValidObjectId(userId)) {
    filter.owner = userId;
  }

  // Filter by specific playlist (if valid ObjectId)
  if (playlistId && mongoose.isValidObjectId(playlistId)) {
    filter.playlist = playlistId;
  }

  // Filter by specific category (if valid ObjectId)
  if (categoryId && mongoose.isValidObjectId(categoryId)) {
    filter.category = categoryId;
  }

  // Step 2: Define sorting
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // default sorting: newest first
  }

  // Step 3: Pagination logic
  const skip = (page - 1) * limit;

  // Step 4: Fetch videos
  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "username email")
    .populate("playlist", "title description")
    .populate("category", "name");

  // Step 5: Get total count for pagination
  const totalVideos = await Video.countDocuments(filter);

  // Step 6: Return structured response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        currentPage: Number(page),
        totalPages: Math.ceil(totalVideos / limit),
        totalVideos,
      },
      "Videos fetched successfully."
    )
  );
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

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found.");
  }
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video },
        "Video publish status toggled successfully."
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId)
    .populate("video", "title description")
    .populate("owner", "username fullName")
    .populate("playlist", "title description")
    .populate("category", "name");

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video fetched successfully."));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  const { title, description } = req.body;
  let { playlist, category } = req.body;

  // ensure authenticated
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  // ensure owner
  if (String(video.owner) !== String(userId)) {
    throw new ApiError(403, "Forbidden: you are not the owner of this video.");
  }

  // update title & description
  if (title !== undefined) {
    if (String(title).trim() === "")
      throw new ApiError(400, "Title must not be empty.");
    video.title = title;
  }
  if (description !== undefined) {
    video.description = description;
  }

  // handle category (accept id or name)
  if (
    category !== undefined &&
    category !== null &&
    String(category).trim() !== ""
  ) {
    if (isValidObjectId(category)) {
      const existingCat = await Category.findById(category);
      if (!existingCat) throw new ApiError(404, "Category not found.");
      video.category = existingCat._id;
    } else {
      let cat = await Category.findOne({ name: category.trim() });
      if (!cat) {
        cat = await Category.create({ name: category.trim() });
      }
      video.category = cat._id;
    }
  }

  // handle playlist (accept id or title)
  if (
    playlist !== undefined &&
    playlist !== null &&
    String(playlist).trim() !== ""
  ) {
    if (isValidObjectId(playlist)) {
      const existingPl = await Playlist.findById(playlist);
      if (!existingPl) throw new ApiError(404, "Playlist not found.");
      video.playlist = existingPl._id;
    } else {
      let pl = await Playlist.findOne({ title: playlist.trim() });
      if (!pl) {
        pl = await Playlist.create({ title: playlist.trim() });
      }
      video.playlist = pl._id;
    }
  }

  // handle thumbnail upload if provided
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (thumbnailLocalPath) {
    const uploadedThumb = await uploadOnCloudinary(thumbnailLocalPath);
    if (!uploadedThumb)
      throw new ApiError(500, "Thumbnail upload failed, please retry.");
    video.thumbnail =
      uploadedThumb.secure_url || uploadedThumb.url || video.thumbnail;
  }

  // save and return populated video
  await video.save({ validateBeforeSave: false });

  const updatedVideo = await Video.findById(video._id)
    .populate("owner", "username fullName")
    .populate("playlist", "title description")
    .populate("category", "name");

  if (!updatedVideo)
    throw new ApiError(500, "Something went wrong while updating the video.");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { video: updatedVideo },
        "Video updated successfully."
      )
    );
  //TODO: update video de   tails like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  // Remove video from its playlist if applicable
  if (video.playlist) {
    await Playlist.findByIdAndUpdate(video.playlist, {
      $pull: { videos: video._id },
    });
  }

  // Remove video from its category if applicable
  if (video.category) {
    await Category.findByIdAndUpdate(video.category, {
      $pull: { videos: video._id },
    });
  }

  // Delete the video
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully."));
  //TODO: delete video
});

const incrementViewCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found.");
  }

  video.views += 1;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { views: video.views },
        "View count incremented."
      )
    );
});


export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublishStatus,
  incrementViewCount,
};
