import { Router } from "express";
import * as themeSettingsController from "../controllers/themeSettingsController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { uploadHeroMedia } from "../middleware/settingsMediaUploadMiddleware.js";

const themeSettingsRoutes = Router();

themeSettingsRoutes.get("/", themeSettingsController.getThemeSettings);
themeSettingsRoutes.put("/",authenticateUser,authorizeRoles("super_admin"),themeSettingsController.updateThemeSettings,);
themeSettingsRoutes.patch("/hero-media",authenticateUser,authorizeRoles("super_admin"),uploadHeroMedia.single("heroMedia"),themeSettingsController.updateHeroMedia,);

export default themeSettingsRoutes;
