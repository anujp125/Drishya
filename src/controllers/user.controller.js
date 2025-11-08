import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  // Validation
  if (
    !username?.trim() ||
    !email?.trim() ||
    !fullName?.trim() ||
    !password?.trim()
  ) {
    throw new ApiError(400, "All required fields are needed to be filled!");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existedUser) throw new ApiError(409, "User already exists!");

  // File handling
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required!");

  // Uploading files
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar)
    throw new ApiError(500, "Avatar upload failed, please try again.");

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    fullName,
    password,
    avatar: avatar.secure_url || avatar.url,
    coverImage: coverImage?.secure_url || coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user!");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully!"));
});

export { registerUser };
