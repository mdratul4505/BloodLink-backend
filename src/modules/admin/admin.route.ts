import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate.js";
import AdminController from "./admin.controller.js";
import AdminValidation from "./admin.validation.js";

const router = Router();

// Protect all admin routes with auth("ADMIN")
router.use(auth("ADMIN"));

router.get("/users", AdminController.getAllUsers);

router.patch(
  "/users/:id/status",
  validateRequest(AdminValidation.updateUserStatusSchema),
  AdminController.updateUserStatus,
);

router.patch(
  "/organizations/:id/verify",
  validateRequest(AdminValidation.verifyOrganizationSchema),
  AdminController.verifyOrganization,
);

router.get("/dashboard-stats", AdminController.getDashboardStats);

router.get("/audit-logs", AdminController.getAuditLogs);

router.get("/payments", AdminController.getAdminPayments);

export const AdminRoutes = router;
export default AdminRoutes;
