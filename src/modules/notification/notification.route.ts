import { Router } from "express";
import auth from "../../middlewares/auth.js";
import NotificationController from "./notification.controller.js";

const router = Router();

router.get("/", auth(), NotificationController.getMyNotifications);

router.patch("/read-all", auth(), NotificationController.markAllNotificationsAsRead);

router.patch("/:id/read", auth(), NotificationController.markNotificationAsRead);

export const NotificationRoutes = router;
export default NotificationRoutes;
