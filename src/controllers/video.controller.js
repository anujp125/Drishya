import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, playlist, category, isPublished } = req.body;

  console.log(req.body);

  if (!title || !description || !playlist || !category) {
    throw new ApiError(400, "All fields are required.");
  }

  if (title?.trim() == "") throw new ApiError(400, "Title must not be empty.");

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

  console.log(videoUploaded);

  const userId = req.user?._id;

  console.log(req.user);

  if (!userId) throw new ApiError(401, "Unauthorized: please login first.");

  const user = await User.findById(userId).select("username");
  const owner = user?.username;

  console.log(owner);

  const video = await Video.create({
    title: title,
    description: description,
    owner: userId,
    duration: videoUploaded?.duration || null,
    playlist: playlist,
    category: category,
    isPublished: isPublished,
    videoFile: videoUploaded?.url,
    thumbnail: thumbnailUploaded?.url || thumbnailUploaded?.secure_url || "",
  });

  console.log(video);

  const videoDetails = await Video.findById(video._id);

  console.log(videoDetails);

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

export { uploadVideo };
