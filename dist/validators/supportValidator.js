const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateSupportRequest = (body) => {
    if (!body || typeof body !== "object") {
        return { isValid: false, message: "Support request details are required." };
    }
    const input = body;
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const subject = typeof input.subject === "string" ? input.subject.trim() : "";
    const message = typeof input.message === "string" ? input.message.trim() : "";
    if (!name || !email || !subject || !message) {
        return {
            isValid: false,
            message: "All support request fields are required.",
        };
    }
    if (name.length > 100)
        return {
            isValid: false,
            message: "Name must not exceed 100 characters."
        };
    if (!emailPattern.test(email) || email.length > 254)
        return {
            isValid: false,
            message: "Enter a valid email address."
        };
    if (subject.length > 150)
        return {
            isValid: false,
            message: "Subject must not exceed 150 characters.",
        };
    if (message.length < 10 || message.length > 2000)
        return {
            isValid: false,
            message: "Message must contain between 10 and 2000 characters.",
        };
    return {
        isValid: true,
        data: {
            name,
            email,
            subject,
            message
        }
    };
};
//# sourceMappingURL=supportValidator.js.map