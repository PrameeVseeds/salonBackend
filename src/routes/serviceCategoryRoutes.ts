import { Router } from "express";
import * as controller from "../controllers/serviceCategoryController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";

const router = Router();
const adminOnly = [authenticateUser, authorizeRoles("admin", "super_admin")];
router.get("/", controller.getAll);
router.post("/", ...adminOnly, controller.create);
router.put("/:id", ...adminOnly, controller.update);
router.delete("/:id", ...adminOnly, controller.remove);
export default router;
