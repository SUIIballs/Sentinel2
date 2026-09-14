import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import emergencyRoutes from "./routes/emergencyRoutes";

dotenv.config();

const app = express();

const PORT = Number(
  process.env.PORT || 5000
);

/*
 * CORS
 */
app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
    ],
  })
);

/*
 * Handle JSON requests.
 */
app.use(
  express.json()
);

/*
 * Temporary request logger.
 */
app.use(
  (req, _res, next) => {
    console.log(
      "🌐 REQUEST:",
      req.method,
      req.url
    );

    next();
  }
);

/*
 * Emergency routes.
 */
app.use(
  "/api/emergency",
  emergencyRoutes
);

/*
 * Root endpoint.
 */
app.get(
  "/",
  (_req, res) => {
    res.json({
      success: true,
      message:
        "Sentinel Emergency Alert Backend is running.",
    });
  }
);

/*
 * Health endpoint.
 */
app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      success: true,
      service:
        "Sentinel Backend",
      status: "healthy",
    });
  }
);

/*
 * Start server.
 */
app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `🚨 Sentinel Backend running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      `http://192.168.1.6:${PORT}`
    );
  }
);