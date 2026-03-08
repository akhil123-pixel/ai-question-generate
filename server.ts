import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import connectDB from "./server/config/db.ts";
import authRoutes from "./server/routes/authRoutes.ts";
import resumeRoutes from "./server/routes/resumeRoutes.ts";
import questionRoutes from "./server/routes/questionRoutes.ts";
import historyRoutes from "./server/routes/historyRoutes.ts";
import { errorHandler } from "./server/middleware/error.ts";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Connect to Database
  connectDB();

  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from uploads folder
  app.use("/uploads", express.static(path.join(__dirname, "server/uploads")));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/resume", resumeRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/history", historyRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AI Interview Generator API is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  // Error Handler Middleware (should be after routes)
  app.use(errorHandler);

  // Start Server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("START SERVER ERROR:", err);
  import('fs').then(fs => fs.writeFileSync('error_dump.txt', err.stack || String(err)));
});
