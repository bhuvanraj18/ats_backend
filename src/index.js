import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import routes (ES MODULE STYLE)
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());

// -------------------- ROUTES --------------------
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.send("ATS Backend is running");
});

// -------------------- GLOBAL ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
