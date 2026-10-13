import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import AdminService from "./admin.service.js";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.users,
  });
});

export const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!.id;
    const result = await AdminService.updateUserStatus(
      id as string,
      adminId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `User status successfully updated to ${req.body.status}`,
      data: result,
    });
  },
);

export const verifyOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const adminId = req.user!.id;
    const result = await AdminService.verifyOrganization(
      id as string,
      adminId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Organization ${req.body.verificationStatus.toLowerCase()} successfully`,
      data: result,
    });
  },
);

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getDashboardStats();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin dashboard stats retrieved successfully",
      data: result,
    });
  },
);

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLogs({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audit logs fetched successfully",
    meta: result.meta,
    data: result.logs,
  });
});

export const getAdminPayments = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getAdminPayments(req.query as any);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All payments fetched successfully",
      meta: result.meta,
      data: result.payments,
    });
  },
);

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  verifyOrganization,
  getDashboardStats,
  getAuditLogs,
  getAdminPayments,
};

export default AdminController;
