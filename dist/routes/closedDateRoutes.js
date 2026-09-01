import { Router } from "express";
import * as controller from "../controllers/closedDateController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
const router = Router();
const adminOnly = [authenticateUser, authorizeRoles("super_admin", "admin")];
router.post("/", ...adminOnly, controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", ...adminOnly, controller.update);
router.delete("/:id", ...adminOnly, controller.remove);
export default router;
//# sourceMappingURL=closedDateRoutes.js.map