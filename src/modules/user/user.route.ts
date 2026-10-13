import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate.js";
import UserController from "./user.controller.js";
import UserValidation from "./user.validation.js";

const router = Router();

// Profile management
router.get("/me", auth(), UserController.getMyProfile);

router.patch(
  "/me",
  auth(),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateMyProfile,
);

// Donor availability endpoint as listed in requirements: PATCH /donors/me/availability
router.patch(
  "/availability",
  auth(),
  validateRequest(UserValidation.toggleDonorAvailabilitySchema),
  UserController.updateDonorAvailability,
);

export const UserRoutes = router;
export default UserRoutes;
