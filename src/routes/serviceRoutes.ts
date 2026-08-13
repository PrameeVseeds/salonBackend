import { Router } from "express";
import * as serviceController from "../controllers/serviceController.js";

const router = Router();

router.post("/", serviceController.createService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", serviceController.updateService);
router.patch("/:id/status", serviceController.updateServiceStatus);
router.delete("/:id", serviceController.deleteService);

export default router;
