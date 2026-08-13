import { Router } from "express";
import * as employeeController from "../controllers/employeeController.js";
import * as employeeServiceController from "../controllers/employeeServiceController.js";
import * as employeeLeaveController from "../controllers/employeeLeaveController.js";

const router = Router();

router.post("/register", employeeController.registetEmployee);
router.get("/", employeeController.getAllEmployees);
router.get("/get-by-email", employeeController.getEmployeeByEmail);
router.get("/get-by-name", employeeController.getEmployeeByName);
router.get("/get-by-phone", employeeController.getEmployeeByPhone);
router.get("/:employeeId/leaves", employeeLeaveController.getEmployeeLeaves);
router.post("/:employeeId/services/:serviceId", employeeServiceController.assignService);
router.get("/:employeeId/services", employeeServiceController.getEmployeeServices);
router.delete("/:employeeId/services/:serviceId", employeeServiceController.removeService);
router.get("/:id", employeeController.getEmployeeProfile);
router.put("/:id/profile", employeeController.updateEmployee);
router.patch("/:id/profile/image", employeeController.updateEmployeeProfileImage);
router.patch("/:id/status", employeeController.updateEmployeeStatus);
router.delete("/:id", employeeController.deleteEmployee);

export default router;
