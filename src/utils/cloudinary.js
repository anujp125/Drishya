import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    // Return essential info only (optional)
    return {
      url: response.secure_url,
      public_id: response.public_id,
    };

    // Return full response info(previously implemented, not ideal incase of large responses)
    // return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Attempt to remove file if it exists
    try {
      if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    } catch (unlinkError) {
      console.error("Error cleaning up local file:", unlinkError);
    }

    return null;
  }
};

export { uploadOnCloudinary };
