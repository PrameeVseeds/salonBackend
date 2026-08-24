import "dotenv/config";

import app from "./app.js";
import { testDatabaseConnection } from "./config/db.js";
import { verifyEmailConnection } from "./services/emailService.js";
import { processTimedAppointmentStatuses } from "./services/appointmentService.js";

const DEFAULT_PORT = 5000;
const HOST = "0.0.0.0";
const AUTO_CANCELLATION_INTERVAL_MS = 60_000;

const port = Number(process.env.PORT) || DEFAULT_PORT;

async function startServer(): Promise<void> {
  try {
    await testDatabaseConnection();

    try {
      await verifyEmailConnection();
      console.log("Email service connected successfully!");
    } catch (error: unknown) {
      console.warn(
        "Email service is unavailable. The API will start, but email features will fail until SMTP credentials are corrected.",
      );
      console.warn(error instanceof Error ? error.message : error);
    }

    app.listen(port, HOST, () => {
      console.log(`Salon API is running on port ${port}`);
    });
    await processTimedAppointmentStatuses();
    const appointmentStatusTimer = setInterval(() => {
      void processTimedAppointmentStatuses().catch((error) =>
        console.error("Failed to process timed appointment statuses:", error),
      );
    }, AUTO_CANCELLATION_INTERVAL_MS);
    appointmentStatusTimer.unref();
  } catch (error: unknown) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

void startServer();
