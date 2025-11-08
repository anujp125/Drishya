import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables early

const app = express();

/* -----------------------------------------------
   🔒 1. CORS (Cross-Origin Resource Sharing)
   - Allows frontend (React, etc.) to communicate with backend.
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

/* -----------------------------------------------
   🛣️ 6. Routes Declaration
   - All user-related routes start with /api/v1/users
-------------------------------------------------- */
app.use("/api/v1/users", userRouter);

/* -----------------------------------------------
   ⚠️ 7. Global Error Handling Middleware (optional, but recommended)
   - Catches all errors thrown via asyncHandler or ApiError
-------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export { app };
