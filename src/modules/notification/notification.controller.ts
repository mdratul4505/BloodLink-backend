import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import NotificationService from "./notification.service.js";

export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await NotificationService.getMyNotifications(userId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      unreadOnly: req.query.unreadOnly === "true",
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notifications fetched successfully",
      meta: result.meta,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount,
      },
    });
  },
);

export const markNotificationAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await NotificationService.markNotificationAsRead(
      id as string,
      userId,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  },
);

export const markAllNotificationsAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await NotificationService.markAllNotificationsAsRead(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  },
);

export const NotificationController = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default NotificationController;
