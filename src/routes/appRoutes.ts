import {Router,type Request,type Response,} from "express";
import authRoutes from "./authRoutes.js";


const router = Router();

router.get("/health",(_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "API routes are working",
    });
  }
);

router.use("/auth", authRoutes);

export default router;