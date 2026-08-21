import { Router } from "express";
import { changePassword, forgotPassword, getProfile, getSuperAdminDashboard, login, resetPassword, updateProfile } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.patch('/change-password', authenticateUser, changePassword);
router.get('/super-admin-dashboard', authenticateUser, authorizeRoles('super_admin'), getSuperAdminDashboard);

export default router;