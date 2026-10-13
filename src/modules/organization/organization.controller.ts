import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import OrganizationService from "./organization.service.js";

export const applyOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await OrganizationService.applyOrganization(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:
        "Organization application submitted successfully. It will be reviewed by admin.",
      data: result,
    });
  },
);

export const getAllOrganizations = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationService.getAllOrganizations(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organizations fetched successfully",
      meta: result.meta,
      data: result.organizations,
    });
  },
);

export const getOrganizationById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OrganizationService.getOrganizationById(id as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization details fetched successfully",
      data: result,
    });
  },
);

export const updateOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const result = await OrganizationService.updateOrganization(
      id as string,
      userId,
      userRole,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Organization updated successfully",
      data: result,
    });
  },
);

export const OrganizationController = {
  applyOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
};

export default OrganizationController;
