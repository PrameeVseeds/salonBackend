import { Router } from "express";
import * as controller from "../controllers/employeeLeaveController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
const router = Router();
router.use(authenticateUser, authorizeRoles("super_admin", "admin"));
router.post("/", controller.createLeave);
router.get("/", controller.getLeaves);
router.get("/:id", controller.getLeave);
router.put("/:id", controller.updateLeave);
router.delete("/:id", controller.deleteLeave);
export default router;
//# sourceMappingURL=employeeLeaveRoutes.js.map