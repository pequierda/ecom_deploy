import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";  
import plannerRoutes from "./routes/plannerRoutes.js";
import clientRoutes from "./routes/clientRoutes.js"; 
import reportsRoutes from "./routes/reportsRoutes.js";
import statsRoutes from "./routes/statsRoutes.js"; 
// ADD THIS: Import the new planner management routes
import plannerManagementRoutes from "./routes/plannerManagementRoutes.js";

dotenv.config();
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", profileRoutes); 
app.use("/api/packages", packageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);  
app.use("/api/planners", plannerRoutes);
app.use("/api/clients", clientRoutes); 
app.use("/api/reports", reportsRoutes);
app.use("/api/stats", statsRoutes); 

// ADD THIS: Register the new planner management routes for admin
app.use("/api/admin/planners", plannerManagementRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;