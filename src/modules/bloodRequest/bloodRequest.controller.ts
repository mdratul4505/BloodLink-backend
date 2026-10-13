import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import BloodRequestService from "./bloodRequest.service.js";

export const createBloodRequest = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await BloodRequestService.createBloodRequest(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Blood request created successfully",
      data: result,
    });
  },
);

export const getAllBloodRequests = catchAsync(
  async (req: Request, res: Response) => {
    const result = await BloodRequestService.getAllBloodRequests(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blood requests fetched successfully",
      meta: result.meta,
      data: result.requests,
    });
  },
);

export const getMyBloodRequests = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await BloodRequestService.getMyBloodRequests(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My blood requests fetched successfully",
      data: result,
    });
  },
);

export const getBloodRequestById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BloodRequestService.getBloodRequestById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blood request details fetched successfully",
      data: result,
    });
  },
);

export const updateBloodRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await BloodRequestService.updateBloodRequest(
      id as string,
      userId,
      userRole,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blood request updated successfully",
      data: result,
    });
  },
);

export const deleteBloodRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    await BloodRequestService.deleteBloodRequest(id as string, userId, userRole);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Blood request deleted successfully",
      data: null,
    });
  },
);

export const updateRequestStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await BloodRequestService.updateRequestStatus(
      id as string,
      userId,
      userRole,
      req.body.status,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Request status updated successfully",
      data: result,
    });
  },
);

export const respondToRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const donorId = req.user!.id;
    const result = await BloodRequestService.respondToRequest(
      id as string,
      donorId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Response submitted successfully",
      data: result,
    });
  },
);

export const getResponsesForRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await BloodRequestService.getResponsesForRequest(
      id as string,
      userId,
      userRole,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Responses fetched successfully",
      data: result,
    });
  },
);

export const completeDonation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await BloodRequestService.completeDonation(
      id as string,
      userId,
      userRole,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donation completed successfully",
      data: result,
    });
  },
);

export const BloodRequestController = {
  createBloodRequest,
  getAllBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  updateRequestStatus,
  respondToRequest,
  getResponsesForRequest,
  completeDonation,
};

export default BloodRequestController;
