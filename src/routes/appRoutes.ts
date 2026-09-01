import { Router, type Request, type Response } from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js";
import customerManagementRoutes from "./customerManagementRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import serviceRoutes from "./serviceRoutes.js";
import serviceCategoryRoutes from "./serviceCategoryRoutes.js";
import employeeLeaveRoutes from "./employeeLeaveRoutes.js";
import workingHoursRoutes from "./workingHoursRoutes.js";
import businessBreakRoutes from "./businessBreakRoutes.js";
import closedDateRoutes from "./closedDateRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";
import galleryRoutes from "./galleryRoutes.js";
import galleryCategoryRoutes from "./galleryCategoryRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import themeSettingsRoutes from "./themeSettingsRoutes.js";
import supportRoutes from "./supportRoutes.js";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API routes are working",
  });
});

router.use("/auth", authRoutes);
router.use("/admins", adminRoutes);
router.use("/customers", customerRoutes);
router.use("/customers", customerManagementRoutes);
router.use("/employees", employeeRoutes);
router.use("/services", serviceRoutes);
router.use("/service-categories", serviceCategoryRoutes);
router.use("/employee-leaves", employeeLeaveRoutes);
router.use("/working-hours", workingHoursRoutes);
router.use("/business-breaks", businessBreakRoutes);
router.use("/closed-dates", closedDateRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/gallery", galleryRoutes);
router.use("/gallery-categories", galleryCategoryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/settings", settingsRoutes);
router.use("/theme-settings", themeSettingsRoutes);
router.use("/support", supportRoutes);

export default router;
