import { sendSystemSupportEmail } from "../services/emailService.js";
import { validateSupportRequest } from "../validators/supportValidator.js";
export const submitSupportRequest = async (req, res) => {
    const validation = validateSupportRequest(req.body);
    if (!validation.isValid) {
        res.status(400).json({
            success: false,
            message: validation.message
        });
        return;
    }
    try {
        await sendSystemSupportEmail(validation.data);
        res.status(200).json({
            success: true,
            message: "Your support request was sent to the system administrator.",
        });
    }
    catch (error) {
        console.error("Support email error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to send your support request. Please try again later.",
        });
    }
};
//# sourceMappingURL=supportController.js.map