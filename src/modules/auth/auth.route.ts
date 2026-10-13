import { Router } from "express";
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

export const AuthRoutes = router;
export default AuthRoutes;
