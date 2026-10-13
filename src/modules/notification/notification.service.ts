import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

export const getMyNotifications = async (
  userId: string,
  query: { page?: number; limit?: number; unreadOnly?: boolean },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    userId,
  };

  if (query.unreadOnly) {
    whereClause.isRead = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where: whereClause }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const markNotificationAsRead = async (
  id: string,
  userId: string,
) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notification.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this notification",
    );
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updated;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result;
};

export const NotificationService = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default NotificationService;
