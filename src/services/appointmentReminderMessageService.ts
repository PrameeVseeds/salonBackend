import type { AppointmentRow } from "../models/appointmentModel.js";

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
  const customerName = appointment.customer_name ?? "there";
  const time = String(appointment.start_time).slice(0, 5);
  return `Hi ${customerName}! 👋 Just a friendly reminder that your appointment at ${salonName} is scheduled for ${time} today, which is in 15 minutes. We look forward to seeing you soon!\n\nආයුබෝවන් ${customerName}! 👋 මෙය ඔබගේ ඒපොයින්ට්මන්ට් එක පිළිබඳ සුහද මතක් කිරීමකි. ${salonName} හි ඔබගේ ඒපොයින්ට්මන්ට් එක අද ${time} ට, එනම් තවත් විනාඩි 15කින් යෙදී ඇත. ඔබව ඉක්මනින් හමුවීමට අපි බලාපොරොත්තු වෙමු!`;
};
