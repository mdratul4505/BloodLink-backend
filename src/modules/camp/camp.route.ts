import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate.js";
import CampController from "./camp.controller.js";
import CampValidation from "./camp.validation.js";

const router = Router();

router.post(
  "/",
  auth(),
  validateRequest(CampValidation.createCampSchema),
  CampController.createCamp,
);

router.get("/", CampController.getAllCamps);

router.get("/:id", CampController.getCampById);

router.post("/:id/register", auth(), CampController.registerForCamp);

router.patch(
  "/:id/status",
  auth(),
  validateRequest(CampValidation.updateCampStatusSchema),
  CampController.updateCampStatus,
);

export const CampRoutes = router;
export default CampRoutes;
