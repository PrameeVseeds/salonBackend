import { Router } from "express";
import { changePassword, forgotPassword, getProfile, login, register, resetPassword, updateCustomerProfile, updateProfileImage, updateWhatsAppPreference } from "../controllers/customerAuthController.js";
import { authenticateCustomer } from "../middleware/customerAuthMiddleware.js";
import { uploadCustomerImage } from "../middleware/customerImageUploadMiddleware.js";

const router = Router();

router.post('/register', register);
router.post("/login", login);
router.get("/profile", authenticateCustomer, getProfile);
router.put('/profile', authenticateCustomer, updateCustomerProfile);
router.patch("/profile/whatsapp-preference", authenticateCustomer, updateWhatsAppPreference);
router.patch('/change-password', authenticateCustomer, changePassword);
router.patch("/profile/image", authenticateCustomer, uploadCustomerImage.single("profileImage"), updateProfileImage);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
