import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import httpStatus from "http-status";
import config from "./config/index.js";
import globalErrorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";
import applicationRoutes from "./routes/index.js";

const app: Application = express();

// Security middlewares with cross-origin resource policy for HD uploaded avatars
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: [config.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body and Cookie parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for uploaded avatars/images
const uploadsPath = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Root health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Welcome to BloodLink API - Empowering Blood Donors & Saving Lives",
    version: "1.0.0",
    docs: "/api/v1",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Mount application routes
app.use("/api/v1", applicationRoutes);
app.use("/api", applicationRoutes);
app.use("/", applicationRoutes);

// Error handlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;