import type { Request, Response } from "express";
import type { CustomerAuthRequest } from "../middleware/customerAuthMiddleware.js";
import * as service from "../services/appointmentService.js";
import { formatAppointment } from "../utils/mappers/appointmentMapper.js";
import { sendBadRequest } from "../utils/responseHelper.js";
import { validateAppointmentFilters, validateAppointmentId, validateAppointmentRequest, validateAvailabilityQuery } from "../validators/appointmentValidator.js";

const customerId = (req: CustomerAuthRequest): number => req.customer!.id;

const errorResponse = (res: Response, error: unknown, fallback: string): void => {
    const message = error instanceof Error ? error.message : fallback;
    const status = message.includes("not found") ? 404
        : message.includes("unavailable") || message.includes("no longer available") ? 409
            : 500;
    res.status(status).json({ success: false, message });
};

export const availableSlots = async (req: Request, res: Response): Promise<void> => {
    const validation = validateAvailabilityQuery(req.query);

    if (!validation.isValid)
        return sendBadRequest(res, validation.message);

    try {
        const availability = await service.getAvailability(validation.data);
        res.status(200).json(
            {
                success: true, message: "Available slots retrieved successfully.",
                data: {
                    date: validation.data.date,
                    employeeId: validation.data.employeeId,
                    serviceId: validation.data.serviceId,
                    slots: availability.slots,
                    slotDetails: availability.slotDetails,
                    availabilityMessage: availability.message,
                }
            }
        );
    }
    catch (error) {
        errorResponse(res, error, "Failed to retrieve available slots.");
    }
};

export const create = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    const validation = validateAppointmentRequest(req.body ?? {});
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);

    try {
        const appointment = await service.createAppointment(customerId(req), validation.data);
        res.status(201).json(
            {
                success: true, message: "Appointment created successfully.",
                data: { appointment: formatAppointment(appointment) }
            }
        );
    }
    catch (error) {
        errorResponse(res, error, "Failed to create appointment.");
    }
};

export const myAppointments = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    try {
        const appointments = await service.getMyAppointments(customerId(req));
        res.status(200).json(
            {
                success: true, message: "Appointments retrieved successfully.",
                data: { appointments: appointments.map(formatAppointment) }
            }
        );
    }
    catch (error) {
        res.status(500).json(
            { success: false, message: "Failed to retrieve appointments." }
        );
    }
};

export const getOwned = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);
    try {
        const appointment = await service.getOwnedAppointment(validation.data, customerId(req));
        if (!appointment) {
            res.status(404).json({ success: false, message: "Appointment not found." });
            return;
        }

        res.status(200).json(
            {
                success: true, message: "Appointment retrieved successfully.",
                data: { appointment: formatAppointment(appointment) }
            }
        );
    }
    catch (error) {
        res.status(500).json(
            { success: false, message: "Failed to retrieve appointment." }
        );
    }
};

export const updateOwned = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    const id = validateAppointmentId(req.params.id);
    const body = validateAppointmentRequest(req.body ?? {});
    if (!id.isValid) 
        return sendBadRequest(res, id.message);

    if (!body.isValid) 
        return sendBadRequest(res, body.message);

    try {
        const appointment = await service.updateAppointment(id.data, customerId(req), body.data);
        res.status(200).json(
            {
                success: true, message: "Appointment updated successfully.",
                data: { appointment: formatAppointment(appointment) }
            }
        );
    }
    catch (error) {
        res.status(500).json(
            { success: false, message: "Failed to update appointment." }
        );
    }
};

export const deleteOwned = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);

    try {
        if (!(await service.deleteOwnedAppointment(validation.data, customerId(req)))) {
            res.status(404).json({ success: false, message: "Appointment not found." });
            return;
        }
        res.status(200).json(
            { success: true, message: "Appointment deleted successfully." }
        );
    }
    catch (error) {
        res.status(500).json(
            { success: false, message: "Failed to delete appointment." }
        );
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    const validation = validateAppointmentFilters(req.query);
    if (!validation.isValid)
        return sendBadRequest(res, validation.message);

    try {
        const appointments = await service.getAllAppointments(validation.data);
        res.status(200).json(
            {
                success: true, message: "Appointments retrieved successfully.",
                data: { appointments: appointments.map(formatAppointment) }
            }
        );
    }
    catch (error) {
        res.status(500).json(
            { success: false, message: "Failed to retrieve appointments." }
        );
    }
};

const changeStatus = async (req: Request<{ id: string }>,
    res: Response,action: "start" | "complete",): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid) 
        return sendBadRequest(res, validation.message);

    try {
        const appointment = action === "start"
            ? await service.startAppointment(validation.data)
            : await service.completeAppointment(validation.data);
        res.status(200).json({
            success: true,
            message: action === "start" ? "Appointment started successfully." : "Appointment completed successfully.",
            data: { appointment: formatAppointment(appointment) },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update appointment status.";
        res.status(message.includes("Only") ? 409 : 500).json({ success: false, message });
    }
};

export const start = (req: Request<{ id: string }>, res: Response) => changeStatus(req, res, "start");
export const complete = (req: Request<{ id: string }>, res: Response) => changeStatus(req, res, "complete");

export const assignEmployee = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const appointmentId = validateAppointmentId(req.params.id);
    const employeeId = typeof req.body?.employeeId === "number" && Number.isInteger(req.body.employeeId) && req.body.employeeId > 0
        ? req.body.employeeId
        : null;
    const serviceId = typeof req.body?.serviceId === "number" && Number.isInteger(req.body.serviceId)
    && req.body.serviceId > 0
        ? req.body.serviceId : undefined;
    if (!appointmentId.isValid) 
        return sendBadRequest(res, appointmentId.message);
    if (employeeId === null) 
        return sendBadRequest(res, "A valid employee is required.");
    try {
        const appointment = await service.assignEmployeeToAppointment(appointmentId.data, employeeId, serviceId);
        res.status(200).json({
            success: true,
            message: "Employee assigned successfully.",
            data: { appointment: formatAppointment(appointment) },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to assign employee.";
        res.status(message.includes("not found") ? 404 : 409).json({ success: false, message });
    }
};

export const availableEmployees = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid) 
        return sendBadRequest(res, validation.message);
    try {
        const serviceIdValue = Number(req.query.serviceId);
        const serviceId = Number.isInteger(serviceIdValue) && serviceIdValue > 0 ? serviceIdValue : undefined;
        const employeeIds = await service.getAvailableEmployeeIdsForAppointment(validation.data, serviceId);
        res.status(200).json({
            success: true,
            message: "Available employees retrieved successfully.",
            data: { employeeIds },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to retrieve available employees.";
        res.status(message.includes("not found") ? 404 : 500).json({ success: false, message });
    }
};

export const cancel = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid) 
        return sendBadRequest(res, validation.message);
    
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!reason || reason.length > 255)
        return sendBadRequest(res, "Cancellation reason is required and must not exceed 255 characters.");
    try {
        const appointment = await service.cancelAppointment(validation.data, reason);
        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully.",
            data: { appointment: formatAppointment(appointment) },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to cancel appointment.";
        res.status(message.includes("Only") ? 409 : 500).json({ success: false, message });
    }
};

export const cancelOwned = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    const validation = validateAppointmentId(req.params.id);
    if (!validation.isValid) 
        return sendBadRequest(res, validation.message);

    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "Cancelled by customer";
    if (reason.length > 255) 
        return sendBadRequest(res, "Cancellation reason must not exceed 255 characters.");
    try {
        const appointment = await service.cancelCustomerAppointment(validation.data, customerId(req), reason || "Cancelled by customer");
        res.status(200).json({ success: true, message: "Appointment cancelled successfully.", data: { appointment: formatAppointment(appointment) } });
    } catch (error) {
        errorResponse(res, error, "Failed to cancel appointment.");
    }
};
