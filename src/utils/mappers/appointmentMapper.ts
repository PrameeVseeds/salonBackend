import type { AppointmentRow } from "../../models/appointmentModel.js";

export const formatAppointment = (appointment: AppointmentRow) => ({
    id: appointment.id,
    customerId: appointment.customer_id,
    employeeId: appointment.employee_id,
    serviceId: appointment.service_id,
    appointmentDate: appointment.appointment_date,
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    totalAmount: Number(appointment.total_amount),
    notes: appointment.notes,
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
});
