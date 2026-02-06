import "server-only";
import { v2 as cloudinary } from "cloudinary";

const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error("CLOUDINARY_URL is not set in the environment");
}

cloudinary.config({
  cloudinary_url: cloudinaryUrl,
  secure: true,
});

export default cloudinary;
