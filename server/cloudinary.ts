import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// Configure Cloudinary
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload file directly to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File | { buffer: Buffer; mimetype: string; originalname: string }
): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "property-connect",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Upload failed: No result"));
        }
      }
    );

    // Create a readable stream from buffer
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (url: string): Promise<void> => {
  if (!isCloudinaryConfigured()) {
    return; // Silently fail if Cloudinary is not configured
  }

  try {
    // Extract public_id from URL
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{filename}
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      const publicIdParts = urlParts.slice(uploadIndex + 1);
      // Remove file extension
      const publicId = publicIdParts.join("/").replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw - deletion is not critical
  }
};

export default cloudinary;
