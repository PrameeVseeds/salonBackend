import type { AppointmentRow } from "../models/appointmentModel.js";
import { formatAppointmentTime } from "../utils/appointmentDateTime.js";

export const shouldSendWhatsAppAppointmentReminder = (appointment: Pick<AppointmentRow,
  "customer_whatsapp_opt_in" | "customer_phone" | "enable_whatsapp_appointment_reminders">,
): boolean => Boolean(
  appointment.customer_whatsapp_opt_in && appointment.customer_phone &&
  appointment.enable_whatsapp_appointment_reminders &&
  process.env.WHATSAPP_ENABLED?.toLowerCase() === "true",
);

export const buildAppointmentWhatsAppReminder = (
  appointment: AppointmentRow,
  salonName: string,
): string => {
  const customerName = appointment.customer_name ?? "Customer";
  const time = formatAppointmentTime(appointment.start_time);
  return `Hi ${customerName}! Friendly reminder that your appointment at ${salonName} is in 15 minutes at ${time}.`;
};