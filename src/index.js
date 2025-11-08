// Load environment variables before anything else
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/index.js";
import { app } from "./app.js";

/* ---------------------------------------------------------
   🧠 Purpose of this file:
   - Entry point of the server.
   - Connects to MongoDB before starting the Express app.
   - Loads environment variables from .env file.
   - Handles server startup and connection errors gracefully.
---------------------------------------------------------- */

const PORT = process.env.PORT || 8000;

// Start the server only after successful DB connection
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`⚙️  Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err);
    process.exit(1); // Exit process on DB connection failure
  });

/* ---------------------------------------------------------
   🧹 Graceful Shutdown (optional but recommended)
   - Helps close connections properly when app stops
---------------------------------------------------------- */
process.on("SIGINT", async () => {
  console.log("\n🧹  Gracefully shutting down server...");
  process.exit(0);
});
