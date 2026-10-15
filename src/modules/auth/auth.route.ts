import { Router } from "express";
import auth from "../../middlewares/auth.js";
import rateLimiter from "../../middlewares/rateLimit.js";
import validateRequest from "../../middlewares/validate.js";
import AuthController from "./auth.controller.js";
import AuthValidation from "./auth.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.register,
);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailOtpValidationSchema),
  AuthController.verifyEmailOtp,
);

router.post(
  "/resend-verification-otp",
  rateLimiter({
    keyPrefix: "resend-verify-otp",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many OTP requests. Please wait 15 minutes.",
  }),
  validateRequest(AuthValidation.resendEmailOtpValidationSchema),
  AuthController.resendEmailOtp,
);

router.post(
  "/login",
  rateLimiter({
    keyPrefix: "login",
    maxRequests: 10,
    windowSeconds: 60 * 15,
    message: "Too many login attempts. Please try again after 15 minutes.",
  }),
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login,
);

router.post(
  "/google",
  validateRequest(AuthValidation.googleAuthValidationSchema),
  AuthController.googleAuth,
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken,
);

router.post("/logout", AuthController.logout);

// --- Password Reset & OTP Features ---
router.post(
  "/send-otp",
  rateLimiter({
    keyPrefix: "send-otp",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many OTP requests. Please wait 15 minutes.",
  }),
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  "/forgot-password",
  rateLimiter({
    keyPrefix: "forgot-password",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many password reset requests. Please wait 15 minutes.",
  }),
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword,
);

router.post(
  "/verify-otp",
  validateRequest(AuthValidation.verifyOtpValidationSchema),
  AuthController.verifyResetOtp,
);

router.post(
  "/reset-password",
  rateLimiter({
    keyPrefix: "reset-password",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many reset attempts. Please wait 15 minutes.",
  }),
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword,
);

// Authenticated user password change (requires oldPassword and newPassword)
router.post(
  "/change-password",
  auth(),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword,
);

export const AuthRoutes = router;
export default AuthRoutes;
