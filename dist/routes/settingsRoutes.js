import { Router } from "express";
import * as settingsController from "../controllers/settingsController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { uploadLogo } from "../middleware/settingsMediaUploadMiddleware.js";
const settingsRoutes = Router();
settingsRoutes.get("/", settingsController.getSettings);
settingsRoutes.put("/", authenticateUser, authorizeRoles("admin", "super_admin"), settingsController.putSettings);
settingsRoutes.patch("/logo", authenticateUser, authorizeRoles("admin", "super_admin"), uploadLogo.single("logo"), settingsController.patchLogo);
export default settingsRoutes;
//# sourceMappingURL=settingsRoutes.js.map