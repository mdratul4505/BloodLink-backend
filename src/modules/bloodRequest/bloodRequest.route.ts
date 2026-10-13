import { Router } from "express";
import auth from "../../middlewares/auth.js";
import rateLimiter from "../../middlewares/rateLimit.js";
import validateRequest from "../../middlewares/validate.js";
import BloodRequestController from "./bloodRequest.controller.js";
import BloodRequestValidation from "./bloodRequest.validation.js";

const router = Router();

router.post(
  "/",
  auth(),
  rateLimiter({
    keyPrefix: "create_request",
    maxRequests: 20,
    windowSeconds: 60 * 60,
    message: "Too many blood requests created. Please try again later.",
  }),
  validateRequest(BloodRequestValidation.createBloodRequestSchema),
  BloodRequestController.createBloodRequest,
);

router.get("/", BloodRequestController.getAllBloodRequests);

router.get("/my-requests", auth(), BloodRequestController.getMyBloodRequests);

router.get("/:id", BloodRequestController.getBloodRequestById);

router.patch(
  "/:id",
  auth(),
  validateRequest(BloodRequestValidation.updateBloodRequestSchema),
  BloodRequestController.updateBloodRequest,
);

router.delete("/:id", auth(), BloodRequestController.deleteBloodRequest);

router.post(
  "/:id/respond",
  auth(),
  validateRequest(BloodRequestValidation.donorRespondSchema),
  BloodRequestController.respondToRequest,
);

router.get("/:id/responses", auth(), BloodRequestController.getResponsesForRequest);

router.patch(
  "/:id/status",
  auth(),
  validateRequest(BloodRequestValidation.updateRequestStatusSchema),
  BloodRequestController.updateRequestStatus,
);

router.post(
  "/:id/complete-donation",
  auth(),
  validateRequest(BloodRequestValidation.completeDonationSchema),
  BloodRequestController.completeDonation,
);

export const BloodRequestRoutes = router;
export default BloodRequestRoutes;
