import type { AppointmentRow } from "../models/appointmentModel.js";

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

export const buildAppointmentWhatsAppReminder = (
  appointment: AppointmentRow,
  salonName: string,
): string => `Hi ${appointment.customer_name ?? "there"},

This is a reminder from ${salonName} for your upcoming appointment.

Date: ${String(appointment.appointment_date).slice(0, 10)}
Time: ${String(appointment.start_time).slice(0, 5)}
Professional: ${appointment.employee_name ?? "To be confirmed"}
Service: ${uniqueServiceNames(appointment) || "Appointment service"}

We look forward to seeing you.`;
