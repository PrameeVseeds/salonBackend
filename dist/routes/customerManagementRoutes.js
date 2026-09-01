import { Router } from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { getCustomer, getCustomers, getCustomerUsingEmail, updateCustomerStatus } from "../controllers/customerManagementController.js";
const router = Router();
router.get("/", authenticateUser, authorizeRoles("super_admin", "admin"), getCustomers);
router.get("/by-email", authenticateUser, authorizeRoles("super_admin", "admin"), getCustomerUsingEmail);
router.get("/:id", authenticateUser, authorizeRoles("super_admin", "admin"), getCustomer);
router.patch("/:id/status", authenticateUser, authorizeRoles("super_admin", "admin"), updateCustomerStatus);
export default router;
//# sourceMappingURL=customerManagementRoutes.js.map