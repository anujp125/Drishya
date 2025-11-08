import { Router } from "express";
import {
  logInUser,
  logOutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new Express Router instance
const router = Router();

/*
  POST /api/v1/users/register

  - This route handles user registration.
  - It accepts form-data (not JSON) because we’re uploading files (avatar & coverImage).
  - The multer middleware (upload.fields)is used to handle both files.
  - After the files are uploaded and stored temporarily, 
    the controller (registerUser) handles validation, Cloudinary upload, and DB insertion.
*/

router.route("/register").post(
  upload.fields([
    {
      name: "avatar", // the "name" field in form-data (frontend)
      maxCount: 1,
    },
    {
      name: "coverImage", // optional banner image
      maxCount: 1,
    },
  ]),
  registerUser // controller
);

router.route("/login").post(logInUser);

router.route("/logout").post(verifyJWT, logOutUser);

export default router;
