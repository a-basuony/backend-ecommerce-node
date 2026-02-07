import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import serverless from "serverless-http";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Trust Proxy - ضروري جداً لعمل الكوكيز على Vercel
app.set("trust proxy", 1);

// 2. Dynamic CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-commerce-full-stack-mern.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean); // يحذف أي قيم undefined

const corsOptions = {
  origin: function (origin, callback) {
    // السماح بالطلبات التي ليس لها origin (مثل الـ mobile apps أو curl)
    // أو الطلبات التي تنتهي بـ .vercel.app أو الموجودة في القائمة
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.includes("vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "set-cookie"],
};

app.use(cors(corsOptions));

// 3. Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Test Route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is running successfully!",
    env: process.env.NODE_ENV,
    origin: req.headers.origin,
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Database Connection
connectDB();

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
  });
}

export const handler = serverless(app);
export default app;
