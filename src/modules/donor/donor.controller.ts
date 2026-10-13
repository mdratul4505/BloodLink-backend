import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import DonorService from "./donor.service.js";

export const getAllDonors = catchAsync(async (req: Request, res: Response) => {
  const result = await DonorService.getAllDonors(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donors retrieved successfully",
    meta: result.meta,
    data: result.donors,
  });
});

export const getDonorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DonorService.getDonorById(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donor details retrieved successfully",
    data: result,
  });
});

export const DonorController = {
  getAllDonors,
  getDonorById,
};

export default DonorController;
