import express, {type ErrorRequestHandler,type RequestHandler,} from "express";
import apiRoutes from "./routes/appRoutes.js";
import path from "path";

const app = express();

app.use(express.json({ limit: "10kb" }));

const healthCheckHandler: RequestHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Salon API is running",
  });
};

app.get("/", healthCheckHandler);

app.use("/uploads",express.static(path.resolve("uploads")));

app.use("/api", apiRoutes);

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

app.use(notFoundHandler);

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error("Unhandled application error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

app.use(globalErrorHandler);

export default app;