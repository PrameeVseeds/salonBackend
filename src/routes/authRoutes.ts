import { Router } from "express";
import { getProfile, getSuperAdminDashboard, login } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);
router.get('/super-admin-dashboard', authenticateUser, authorizeRoles('super_admin'), getSuperAdminDashboard);

export default router;