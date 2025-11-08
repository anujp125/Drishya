import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(userId);
    const refreshToken = user.generateRefreshToken(userId);

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens!");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;

  // Data Validation
  if (!username || !email || !fullName || !password) {
    throw new ApiError(400, "All required fields are needed to be filled!");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [
      { username: username.trim()?.toLowerCase() },
      { email: email.trim()?.toLowerCase() },
    ],
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
    throw new ApiError(500, "Avatar upload failed, please try again!");

  // Create user
  const user = await User.create({
    username: username.trim()?.toLowerCase(),
    email: email.trim()?.toLowerCase(),
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

const logInUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Data Validation
  if (!username || !email || !password) {
    throw new ApiError(400, "Credentials must be filled!");
  }

  // Finding User
  const user = await user.findOne({
    $or: [
      { username: username.trim()?.toLowerCase() },
      { email: email.trim()?.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(401, "User does not exist!");
  }

  // Password Validation
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Incorrect Credentials!");
  }

  // Access and Refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // Fetch Updated loggedInUser object
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Make data immutable on frontend
  const options = {
    htttpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("AccessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User logged In successfully!"
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  // Make data immutable on frontend
  const options = {
    htttpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User logged Out successfully!");
});
export { registerUser, logInUser, logOutUser };
