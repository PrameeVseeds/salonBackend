import { Router } from "express";
import * as controller from "../controllers/notificationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { authenticateCustomer } from "../middleware/customerAuthMiddleware.js";
const router = Router();
const adminOnly = [authenticateUser, authorizeRoles("super_admin", "admin")];
router.get("/my", authenticateCustomer, controller.getMy);
router.get("/", ...adminOnly, controller.getAll);
router.get("/:id", ...adminOnly, controller.getById);
router.post("/:id/retry", ...adminOnly, controller.retry);
export default router;
//# sourceMappingURL=notificationRoutes.js.map