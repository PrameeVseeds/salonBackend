import {Router,type Request,type Response,} from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js"
import customerManagementRoutes from "./customerManagementRoutes.js";
import employeeRoutes from "./employeeRoutes.js";

const router = Router();

router.get("/health",(_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "API routes are working",
    });
  }
);

router.use("/auth", authRoutes);
router.use("/admins", adminRoutes);
router.use("/customers", customerRoutes);
router.use("/customers", customerManagementRoutes);
router.use("/employees", employeeRoutes)

export default router;