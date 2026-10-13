import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import CampService from "./camp.service.js";

export const createCamp = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;
  const result = await CampService.createCamp(userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Donation camp created successfully",
    data: result,
  });
});

export const getAllCamps = catchAsync(async (req: Request, res: Response) => {
  const result = await CampService.getAllCamps(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation camps fetched successfully",
    meta: result.meta,
    data: result.camps,
  });
});

export const getCampById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CampService.getCampById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation camp details fetched successfully",
    data: result,
  });
});

export const registerForCamp = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await CampService.registerForCamp(id as string, userId);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Successfully registered for donation camp",
      data: result,
    });
  },
);

export const updateCampStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await CampService.updateCampStatus(
      id as string,
      userId,
      userRole,
      req.body.status,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Camp status updated successfully",
      data: result,
    });
  },
);

export const CampController = {
  createCamp,
  getAllCamps,
  getCampById,
  registerForCamp,
  updateCampStatus,
};

export default CampController;
