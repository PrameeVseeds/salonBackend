import type { AppointmentRow } from "../../models/appointmentModel.js";

const formatDate = (value: Date | string): string => {
    if (!(value instanceof Date)) return String(value).slice(0, 10);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatAppointment = (appointment: AppointmentRow) => ({
    id: appointment.id,
    customerId: appointment.customer_id,
    employeeId: appointment.employee_id,
    serviceId: appointment.service_id,
    appointmentDate: formatDate(appointment.appointment_date),
    startTime: appointment.start_time,
    endTime: appointment.end_time,
    totalAmount: Number(appointment.total_amount),
    notes: appointment.notes,
    status: appointment.status,
    startedAt: appointment.started_at,
    completedAt: appointment.completed_at,
    cancelledAt: appointment.cancelled_at,
    cancellationReason: appointment.cancellation_reason,
    customerName: appointment.customer_name,
    customerPhone: appointment.customer_phone,
    customerEmail: appointment.customer_email,
    employeeName: appointment.employee_name,
    serviceName: appointment.service_name,
    serviceDurationMinutes: appointment.service_duration_minutes,
    services: appointment.services ?? [],
    createdAt: appointment.created_at,
    updatedAt: appointment.updated_at,
});
