import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate.js";
import OrganizationController from "./organization.controller.js";
import OrganizationValidation from "./organization.validation.js";

const router = Router();

router.post(
  "/",
  auth(),
  validateRequest(OrganizationValidation.applyOrganizationSchema),
  OrganizationController.applyOrganization,
);

router.get("/", OrganizationController.getAllOrganizations);

router.get("/:id", OrganizationController.getOrganizationById);

router.patch(
  "/:id",
  auth(),
  validateRequest(OrganizationValidation.updateOrganizationSchema),
  OrganizationController.updateOrganization,
);

export const OrganizationRoutes = router;
export default OrganizationRoutes;
