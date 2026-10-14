import fs from "fs";
import path from "path";
import type { Request } from "express";
import httpStatus from "http-status";
import multer from "multer";
import AppError from "../utils/AppError.js";

const uploadDir = path.join(process.cwd(), "uploads", "avatars");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        httpStatus.BAD_REQUEST,
        "Only HD image files (.jpg, .jpeg, .png, .webp, .gif) are allowed!",
      ) as any,
      false,
    );
  }
};

// Support HD images up to 15MB without compression loss
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit for high-definition / high-resolution photos
  },
});

export default uploadAvatar;
