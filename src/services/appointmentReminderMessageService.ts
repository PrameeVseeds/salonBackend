import type { AppointmentRow } from "../models/appointmentModel.js";
import { formatAppointmentDate, formatAppointmentTime } from "../utils/appointmentDateTime.js";

export const shouldSendWhatsAppAppointmentReminder = (appointment: Pick<AppointmentRow,
  "customer_whatsapp_opt_in" | "customer_phone" | "enable_whatsapp_appointment_reminders">,
): boolean => Boolean(
  appointment.customer_whatsapp_opt_in && appointment.customer_phone &&
  appointment.enable_whatsapp_appointment_reminders &&
  process.env.WHATSAPP_ENABLED?.toLowerCase() === "true",
);

const uniqueServiceNames = (appointment: AppointmentRow): string => {
  const names = appointment.services?.map((service) => service.serviceName) ?? [appointment.service_name];
  return [...new Set(names.filter((name): name is string => Boolean(name)))].join(", ");
};

const professionalSummary = (appointment: AppointmentRow): string => appointment.services?.length
  ? appointment.services.map((service) =>
    `${service.serviceName}: ${service.employeeName ?? "To be confirmed"}`,
  ).join("\n")
  : appointment.employee_name ?? "To be confirmed";

export const buildAppointmentWhatsAppReminder = (
  appointment: AppointmentRow,
  salonName: string,
): string => `Hi ${appointment.customer_name ?? "there"},

This is a reminder from ${salonName} for your upcoming appointment.

Date: ${formatAppointmentDate(appointment.appointment_date)}
Time: ${formatAppointmentTime(appointment.start_time)}
Professional: ${professionalSummary(appointment)}
Service: ${uniqueServiceNames(appointment) || "Appointment service"}

We look forward to seeing you.`;
