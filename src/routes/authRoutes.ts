import { Router } from "express";
import { getProfile, login } from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateUser, getProfile);

export default router;