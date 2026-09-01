import { getString } from "./validationUtils.js";
const getBoolean = (value) => typeof value === "boolean" ? value : null;
const getInteger = (value, mustBePositive) => typeof value === "number" &&
    Number.isInteger(value) &&
    (mustBePositive ? value > 0 : value >= 0)
    ? value
    : null;
export const validateSettings = (body) => {
    const salonName = getString(body.salonName ?? body.salon_name);
    const phone = getString(body.phone);
    const email = getString(body.email);
    const address = getString(body.address);
    const allowCustomerChooseEmployee = getBoolean(body.allowCustomerChooseEmployee ?? body.allow_customer_choose_employee);
    const enableOnlinePayment = getBoolean(body.enableOnlinePayment ?? body.enable_online_payment);
    const bookingIntervalMinutes = getInteger(body.bookingIntervalMinutes ?? body.booking_interval_minutes, true);
    const appointmentBufferMinutes = getInteger(body.appointmentBufferMinutes ?? body.appointment_buffer_minutes, false);
    const appointmentGracePeriodMinutes = getInteger(body.appointmentGracePeriodMinutes ?? body.appointment_grace_period_minutes, false);
    const appointmentReminderMinutes = getInteger(body.appointmentReminderMinutes ?? body.appointment_reminder_minutes, false);
    if (!salonName || !phone || !email || !address)
        return {
            isValid: false,
            message: "Salon name, phone, email and address are required.",
        };
    if (allowCustomerChooseEmployee === null || enableOnlinePayment === null)
        return {
            isValid: false,
            message: "Configuration flags must be true or false.",
        };
    if (bookingIntervalMinutes === null)
        return {
            isValid: false,
            message: "Booking interval must be a positive whole number.",
        };
    if (appointmentBufferMinutes === null)
        return {
            isValid: false,
            message: "Appointment buffer must be a non-negative whole number.",
        };
    if (appointmentGracePeriodMinutes === null)
        return {
            isValid: false,
            message: "Appointment grace period must be a non-negative whole number.",
        };
    if (appointmentReminderMinutes === null)
        return {
            isValid: false,
            message: "Appointment reminder time must be a non-negative whole number.",
        };
    return {
        isValid: true,
        data: {
            salon_name: salonName,
            phone,
            email,
            address,
            map_url: getString(body.mapUrl ?? body.map_url),
            facebook_url: getString(body.facebookUrl ?? body.facebook_url),
            instagram_url: getString(body.instagramUrl ?? body.instagram_url),
            whatsapp_number: getString(body.whatsappNumber ?? body.whatsapp_number),
            allow_customer_choose_employee: allowCustomerChooseEmployee,
            enable_online_payment: enableOnlinePayment,
            booking_interval_minutes: bookingIntervalMinutes,
            appointment_buffer_minutes: appointmentBufferMinutes,
            appointment_grace_period_minutes: appointmentGracePeriodMinutes,
            appointment_reminder_minutes: appointmentReminderMinutes,
        },
    };
};
//# sourceMappingURL=settingsValidator.js.map