import { Router } from "express";
import * as controller from "../controllers/appointmentController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorizeRolesMiddleware.js";
import { authenticateCustomer } from "../middleware/customerAuthMiddleware.js";
import { getByAppointment } from "../controllers/notificationController.js";

const router = Router();

router.get("/available-slots", controller.availableSlots);
router.post("/", authenticateCustomer, controller.create);
router.get("/my", authenticateCustomer, controller.myAppointments);
router.patch("/my/:id/cancel", authenticateCustomer, controller.cancelOwned);
router.get("/", authenticateUser, authorizeRoles("super_admin", "admin"), controller.getAll);
router.patch("/:id/start", authenticateUser, authorizeRoles("super_admin", "admin"), controller.start);
router.patch("/:id/complete", authenticateUser, authorizeRoles("super_admin", "admin"), controller.complete);
router.patch("/:id/employee", authenticateUser, authorizeRoles("super_admin", "admin"), controller.assignEmployee);
router.patch("/:id/cancel", authenticateUser, authorizeRoles("super_admin", "admin"), controller.cancel);
router.get("/:appointmentId/notifications", authenticateUser, authorizeRoles("super_admin", "admin"), getByAppointment);
router.get("/:id", authenticateCustomer, controller.getOwned);
router.put("/:id", authenticateCustomer, controller.updateOwned);
router.delete("/:id", authenticateCustomer, controller.deleteOwned);

export default router;
