import { Router } from "express";
import auth from "../../middlewares/auth.js";
import uploadAvatar from "../../middlewares/upload.js";
import validateRequest from "../../middlewares/validate.js";
import UserController from "./user.controller.js";
import UserValidation from "./user.validation.js";

const router = Router();

// Profile retrieval (both /me and /profile work)
router.get("/me", auth(), UserController.getMyProfile);
router.get("/profile", auth(), UserController.getMyProfile);

// Profile editing with optional HD avatar file or image URL
router.patch(
  "/me",
  auth(),
  uploadAvatar.single("avatar"),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateMyProfile,
);
router.patch(
  "/profile",
  auth(),
  uploadAvatar.single("avatar"),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateMyProfile,
);

// Dedicated HD Avatar Upload endpoints
router.post(
  "/avatar",
  auth(),
  uploadAvatar.single("avatar"),
  UserController.uploadAvatar,
);
router.post(
  "/me/avatar",
  auth(),
  uploadAvatar.single("avatar"),
  UserController.uploadAvatar,
);

// Donor availability endpoint: PATCH /users/availability
router.patch(
  "/availability",
  auth(),
  validateRequest(UserValidation.toggleDonorAvailabilitySchema),
  UserController.updateDonorAvailability,
);

export const UserRoutes = router;
export default UserRoutes;
