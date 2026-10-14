import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config/index.js";
import AppError from "../../utils/AppError.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import UserService from "./user.service.js";

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await UserService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const payload = { ...req.body };

  // If a file was uploaded, generate accessible HD image URL
  if (req.file) {
    payload.avatar = `${config.backend_url}/uploads/avatars/${req.file.filename}`;
  }

  const result = await UserService.updateMyProfile(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

export const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  if (!req.file) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide an image file with key 'avatar'",
    );
  }

  const avatarUrl = `${config.backend_url}/uploads/avatars/${req.file.filename}`;
  const result = await UserService.updateMyProfile(userId, { avatar: avatarUrl });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "HD profile picture uploaded successfully",
    data: {
      avatarUrl,
      user: result,
    },
  });
});

export const updateDonorAvailability = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await UserService.updateDonorAvailability(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donor availability updated successfully",
      data: result,
    });
  },
);

export const UserController = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  updateDonorAvailability,
};

export default UserController;
