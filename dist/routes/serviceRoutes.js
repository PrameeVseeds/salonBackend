import { Router } from "express";
import * as serviceController from "../controllers/serviceController.js";
import { uploadServiceImage } from "../middleware/serviceImageUploadMiddleware.js";
const router = Router();
router.post("/image", uploadServiceImage.single("serviceImage"), serviceController.uploadImage);
router.post("/:id/sub-services", serviceController.createSubService);
router.put("/:id/sub-services/:subServiceId", serviceController.updateSubService);
router.delete("/:id/sub-services/:subServiceId", serviceController.deleteSubService);
router.post("/", serviceController.createService);
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);
router.put("/:id", serviceController.updateService);
router.patch("/:id/status", serviceController.updateServiceStatus);
router.delete("/:id", serviceController.deleteService);
export default router;
//# sourceMappingURL=serviceRoutes.js.map