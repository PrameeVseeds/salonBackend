import { unlink } from "node:fs/promises";
import path from "node:path";
import * as employeeService from "../services/employeeService.js";
import * as employeeValidator from "../validators/employeeValidator.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { formatEmployee } from "../utils/mappers/employeeMapper.js";
const deleteUploadedFile = async (filePath) => {
    if (filePath) {
        await unlink(filePath).catch(() => undefined);
    }
};
// Deletes a employee's previous profile image from local storage.
const deleteEmployeeImage = async (imagePath) => {
    if (!imagePath?.startsWith("/uploads/employees/")) {
        return;
    }
    const absolutePath = path.resolve("uploads", "employees", path.basename(imagePath));
    try {
        await unlink(absolutePath);
    }
    catch (error) {
        const errorCode = error instanceof Error && "code" in error ? error.code : undefined;
        if (errorCode !== "ENOENT") {
            throw error;
        }
    }
};
export const registetEmployee = async (req, res) => {
    try {
        const validation = employeeValidator.validateRegisterEmployee(req.body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const employee = await employeeService.registerEmployee(validation.data);
        if (!employee) {
            res.status(500).json({
                success: false,
                message: "Failed to create employee account",
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Employee registered successfully",
            data: {
                employee: formatEmployee(employee),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create employee account.";
        const statusCode = message.includes("already exists") ? 409 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
export const getEmployeeProfile = async (req, res) => {
    try {
        const idValidation = employeeValidator.validateEmployeeId(req.params.id);
        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        const employee = await employeeService.getEmployeeById(idValidation.data);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee profile retrieved successfully.",
            data: {
                employee: formatEmployee(employee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employee profile.",
        });
    }
};
export const getAllEmployees = async (_req, res) => {
    try {
        const employees = await employeeService.getAllEmployees();
        res.status(200).json({
            success: true,
            message: "Employees retrieved successfully.",
            data: {
                employees: employees.map(formatEmployee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employees.",
        });
    }
};
export const getEmployeeByEmail = async (req, res) => {
    try {
        const validation = employeeValidator.validateEmployeeEmail(req.query.email);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const employee = await employeeService.getEmployeeByEmail(validation.data);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee retrieved successfully.",
            data: {
                employee: formatEmployee(employee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employee.",
        });
    }
};
export const getEmployeeByName = async (req, res) => {
    try {
        const validation = employeeValidator.validateEmployeeName(req.query.name);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const employee = await employeeService.getEmployeeByName(validation.data);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee retrieved successfully.",
            data: {
                employee: formatEmployee(employee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employee.",
        });
    }
};
export const getEmployeeByPhone = async (req, res) => {
    try {
        const validation = employeeValidator.validateEmployeePhone(req.query.phone);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message);
            return;
        }
        const employee = await employeeService.getEmployeeByPhone(validation.data);
        if (!employee) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee retrieved successfully.",
            data: {
                employee: formatEmployee(employee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve employee.",
        });
    }
};
export const deleteEmployee = async (req, res) => {
    try {
        const idValidation = employeeValidator.validateEmployeeId(req.params.id);
        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        const deleted = await employeeService.deleteEmployee(idValidation.data);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee deleted successfully.",
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to delete employee.",
        });
    }
};
export const updateEmployeeProfileImage = async (req, res) => {
    const uploadedFilePath = req.file ? path.resolve("uploads", "employees", req.file.filename) : null;
    try {
        const idValidation = employeeValidator.validateEmployeeId(req.params.id);
        if (!idValidation.isValid) {
            await deleteUploadedFile(uploadedFilePath);
            sendBadRequest(res, idValidation.message);
            return;
        }
        if (!req.file) {
            sendBadRequest(res, "Profile image is required.");
            return;
        }
        const existingEmployee = await employeeService.getEmployeeById(idValidation.data);
        if (!existingEmployee) {
            await deleteUploadedFile(uploadedFilePath);
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        const newProfileImage = `/uploads/employees/${req.file.filename}`;
        const updatedEmployee = await employeeService.updateEmployeeProfileImageById(idValidation.data, newProfileImage);
        if (!updatedEmployee) {
            await deleteUploadedFile(uploadedFilePath);
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        await deleteEmployeeImage(existingEmployee.profile_image);
        res.status(200).json({
            success: true,
            message: "Employee profile image updated successfully.",
            data: {
                profileImage: updatedEmployee.profile_image,
            },
        });
    }
    catch {
        await deleteUploadedFile(uploadedFilePath);
        res.status(500).json({
            success: false,
            message: "Failed to update employee profile image.",
        });
    }
};
export const updateEmployee = async (req, res) => {
    try {
        const idValidation = employeeValidator.validateEmployeeId(req.params.id);
        const bodyValidation = employeeValidator.validateUpdateEmployee(req.body);
        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        if (!bodyValidation.isValid) {
            sendBadRequest(res, bodyValidation.message);
            return;
        }
        const updatedEmployee = await employeeService.updateEmployeeById(idValidation.data, bodyValidation.data);
        if (!updatedEmployee) {
            res.status(404).json({
                success: false,
                message: "Employee not found.",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Employee updated successfully.",
            data: {
                employee: formatEmployee(updatedEmployee),
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update employee.";
        const statusCode = message.includes("already exists") ? 409 : 500;
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
export const updateEmployeeStatus = async (req, res) => {
    try {
        const idValidation = employeeValidator.validateEmployeeId(req.params.id);
        const statusValidation = employeeValidator.validateEmployeeStatus(req.body);
        if (!idValidation.isValid) {
            sendBadRequest(res, idValidation.message);
            return;
        }
        if (!statusValidation.isValid) {
            sendBadRequest(res, statusValidation.message);
            return;
        }
        const updatedEmployee = await employeeService.updateEmployeeStatusById(idValidation.data, statusValidation.data);
        if (!updatedEmployee) {
            res.status(404).json({
                success: false,
                message: "Employee not found."
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: statusValidation.data ? "Employee activated successfully." : "Employee deactivated successfully.",
            data: {
                employee: formatEmployee(updatedEmployee),
            },
        });
    }
    catch {
        res.status(500).json({
            success: false,
            message: "Failed to update employee status.",
        });
    }
};
//# sourceMappingURL=employeeController.js.map