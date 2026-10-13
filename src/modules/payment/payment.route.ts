import { Router } from "express";
import auth from "../../middlewares/auth.js";
import rateLimiter from "../../middlewares/rateLimit.js";
import validateRequest from "../../middlewares/validate.js";
import PaymentController from "./payment.controller.js";
import PaymentValidation from "./payment.validation.js";

const router = Router();

router.post(
  "/bkash/create",
  auth(),
  rateLimiter({
    keyPrefix: "payment_create",
    maxRequests: 10,
    windowSeconds: 60 * 15,
    message: "Too many payment attempts. Please wait a few minutes.",
  }),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.createBkashPayment,
);

// bKash webhook / redirect callback
router.get("/bkash/callback", PaymentController.handleBkashCallback);

router.get("/my", auth(), PaymentController.getMyPayments);

router.get("/:id", auth(), PaymentController.getPaymentById);

export const PaymentRoutes = router;
export default PaymentRoutes;
