import multer from "multer";
import fs from "fs";
import path from "path";

// Make sure the temp folder exists
const uploadFolder = "./public/temp";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Storage settings — where and how to save files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // unique name = fieldname + timestamp + original extension
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Allowed file types
const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// File filter — checks file type and size
function fileFilter(req, file, cb) {
  // check format
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, PNG, and WEBP image files are allowed."),
      false
    );
  }

  // check size limits per field
  const maxSize =
    file.fieldname === "avatar" ? 16 * 1024 * 1024 : 40 * 1024 * 1024; // avatar=16MB, coverImage=40MB

  if (file.size > maxSize) {
    return cb(
      new Error(
        `${file.fieldname} file is too large! Max size is ${
          file.fieldname === "avatar" ? "16MB" : "40MB"
        }.`
      ),
      false
    );
  }

  cb(null, true); // all good
}

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
});
