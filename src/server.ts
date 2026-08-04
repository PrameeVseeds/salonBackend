import "dotenv/config";

import app from "./app.js";
import { testDatabaseConnection } from "./config/db.js";
import { verifyEmailConnection } from "./services/emailService.js";

const DEFAULT_PORT = 5000;
const HOST = "0.0.0.0";

const port = Number(process.env.PORT) || DEFAULT_PORT;

async function startServer(): Promise<void> {
  try {
    await testDatabaseConnection();
    await verifyEmailConnection();

    app.listen(port, HOST, () => {
      console.log(`Salon API is running on port ${port}`);
    });
  } catch (error: unknown) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
}

void startServer();