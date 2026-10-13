import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate.js";
import UserController from "../user/user.controller.js";
import UserValidation from "../user/user.validation.js";
import DonorController from "./donor.controller.js";
import DonorValidation from "./donor.validation.js";

const router = Router();

// Availability endpoint as requested: PATCH /donors/me/availability
router.patch(
  "/me/availability",
  auth(),
  validateRequest(UserValidation.toggleDonorAvailabilitySchema),
  UserController.updateDonorAvailability,
);

router.get(
  "/",
  validateRequest(DonorValidation.donorFilterValidationSchema),
  DonorController.getAllDonors,
);

router.get("/:id", DonorController.getDonorById);

export const DonorRoutes = router;
export default DonorRoutes;
