import { Router } from "express";
import * as controller from "../controllers/aiConsultationController.js";
import { authenticateCustomer } from "../middleware/customerAuthMiddleware.js";
import { uploadConsultationImage } from "../middleware/aiConsultationImageUploadMiddleware.js";

const router = Router();

router.post("/", authenticateCustomer, uploadConsultationImage.single("image"), controller.create);

export default router;
