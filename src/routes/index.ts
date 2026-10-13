import { Router } from "express";
import { AdminRoutes } from "../modules/admin/admin.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { BloodRequestRoutes } from "../modules/bloodRequest/bloodRequest.route.js";
import { CampRoutes } from "../modules/camp/camp.route.js";
import { DonorRoutes } from "../modules/donor/donor.route.js";
import { NotificationRoutes } from "../modules/notification/notification.route.js";
import { OrganizationRoutes } from "../modules/organization/organization.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { UserRoutes } from "../modules/user/user.route.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/donors",
    route: DonorRoutes,
  },
  {
    path: "/blood-requests",
    route: BloodRequestRoutes,
  },
  {
    path: "/organizations",
    route: OrganizationRoutes,
  },
  {
    path: "/camps",
    route: CampRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/payments",
    route: PaymentRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
];

for (const route of moduleRoutes) {
  router.use(route.path, route.route);
}

export default router;
