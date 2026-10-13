import type { Request, Response } from "express";
import httpStatus from "http-status";
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
  const result = await UserService.updateMyProfile(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
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
  updateDonorAvailability,
};

export default UserController;
