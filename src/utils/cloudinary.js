import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const absolutePath = path.resolve(localFilePath);

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "auto",
    });

    // Safely remove local temp file (async & non-blocking)
    fs.unlink(absolutePath, (err) => {
      if (err) console.warn("⚠ Temp file cleanup failed:", err.message);
      else console.log("✅ Temp file deleted:", absolutePath);
    });

    // Return essential info
    return {
      url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration || 0,
      format: response.format,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error.message);

    // Try cleanup if upload fails
    try {
      const absolutePath = path.resolve(localFilePath);
      if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    } catch (unlinkErr) {
      console.warn("⚠ Cleanup error after failed upload:", unlinkErr.message);
    }

    return null;
  }
};

export { uploadOnCloudinary };
