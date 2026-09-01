import { Router } from "express";
import * as controller from "../controllers/galleryController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { uploadGalleryImage } from "../middleware/galleryImageUploadMiddleware.js";
const router = Router();
const adminOnly = [authenticateUser, authorizeRoles("super_admin", "admin")];
router.post("/", ...adminOnly, uploadGalleryImage.single("image"), controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", ...adminOnly, controller.update);
router.patch("/:id/status", ...adminOnly, controller.updateStatus);
router.patch("/:id/image", ...adminOnly, uploadGalleryImage.single("image"), controller.updateImage);
router.delete("/:id", ...adminOnly, controller.remove);
export default router;
//# sourceMappingURL=galleryRoutes.js.map