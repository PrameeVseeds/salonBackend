import { Router } from "express";
import * as controller from "../controllers/appointmentController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { authenticateCustomer } from "../middleware/customerAuthMiddleware.js";

const router = Router();

router.get("/available-slots", controller.availableSlots);
router.post("/", authenticateCustomer, controller.create);
router.get("/my", authenticateCustomer, controller.myAppointments);
router.get("/", authenticateUser, authorizeRoles("super_admin", "admin"), controller.getAll);
router.get("/:id", authenticateCustomer, controller.getOwned);
router.put("/:id", authenticateCustomer, controller.updateOwned);
router.delete("/:id", authenticateCustomer, controller.deleteOwned);

export default router;
