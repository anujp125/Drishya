import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables early

const app = express();

/* -----------------------------------------------
   🔒 1. CORS (Cross-Origin Resource Sharing)
   - Allows frontend (React, etc.) or Postman to communicate with backend.
   - `credentials: true` enables cookie & token-based auth.
-------------------------------------------------- */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // allow defined origin or fallback
    credentials: true,
  })
);

/* -----------------------------------------------
   📦 2. Body Parsers
   - Parse incoming JSON and URL-encoded data.
   - Limit request body to 16KB to prevent payload abuse.
-------------------------------------------------- */
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

/* -----------------------------------------------
   🌐 3. Static Files
   - Serve static files from the `public` directory
   - e.g., uploaded images, temp files, etc.
-------------------------------------------------- */
app.use(express.static("public"));

/* -----------------------------------------------
   🍪 4. Cookie Parser
   - Parses cookies for JWT tokens or session data.
-------------------------------------------------- */
app.use(cookieParser());

/* -----------------------------------------------
   🧭 5. Import Routes
   - Each module (users, videos, etc.) has its own router file.
-------------------------------------------------- */
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";

/* -----------------------------------------------
   🛣️ 6. Routes Declaration
   - All user-related routes start with /api/v1/users
-------------------------------------------------- */
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
/* -----------------------------------------------
   🚫 7. Not Found Route Handler
   - Handles requests to undefined routes cleanly.
   - Prevents Express from sending empty headers only.
-------------------------------------------------- */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* -----------------------------------------------
   ⚠️ 8. Global Error Handling Middleware
   - Handles all errors thrown via asyncHandler or ApiError.
   - Ensures a clean JSON response (no empty body).
-------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  // If headers are already sent (rare), let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    // Show stack trace only in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/* -----------------------------------------------
   ✅ 9. Export app instance
-------------------------------------------------- */
export { app };
