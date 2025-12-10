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

    // Determine file size
    const { size } = fs.statSync(absolutePath);

    // Choose upload method
    const useLargeUpload = size > 20 * 1024 * 1024; // >20MB threshold

    const uploadFn = useLargeUpload
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;

    // Upload to Cloudinary
    const response = await uploadFn(absolutePath, {
      resource_type: "auto", // "auto" detects image/video
      chunk_size: 6_000_000, // only used by upload_large
      folder: "uploads", // optional folder name
    });

    // Cleanup local file
    fs.unlink(absolutePath, (err) => {
      if (err) console.warn("⚠ Temp cleanup failed:", err.message);
      else console.log("✅ Temp file deleted:", absolutePath);
    });

    return {
      url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration || 0,
      format: response.format,
      bytes: response.bytes,
      resource_type: response.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);

    // Cleanup on upload failure
    try {
      const abs = path.resolve(localFilePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {}
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);

    if (response.result === "ok") {
      console.log("File deleted from Cloudinary:", publicId);
      return true;
    } else {
      console.warn("Cloudinary delete response:", response);
      return false;
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return false;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
