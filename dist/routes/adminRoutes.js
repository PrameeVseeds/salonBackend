import { Router } from "express";
import { createAdminAccount, deleteAdmin, getAdminById, getAdmins, resetAdminPassword, updateAdmin, updateAdminStatus } from "../controllers/adminController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
const router = Router();
router.post("/create", authenticateUser, authorizeRoles("super_admin"), createAdminAccount);
router.get("/", authenticateUser, authorizeRoles("super_admin"), getAdmins);
router.get("/:id", authenticateUser, authorizeRoles("super_admin"), getAdminById);
router.put("/:id", authenticateUser, authorizeRoles("super_admin"), updateAdmin);
router.patch("/:id/status", authenticateUser, authorizeRoles("super_admin"), updateAdminStatus);
router.patch("/:id/reset-password", authenticateUser, authorizeRoles("super_admin"), resetAdminPassword);
router.delete("/:id", authenticateUser, authorizeRoles("super_admin"), deleteAdmin);
export default router;
//# sourceMappingURL=adminRoutes.js.map