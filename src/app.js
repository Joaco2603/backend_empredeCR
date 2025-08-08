import { configureServer, startServer } from "./config/server.js";

import { authMiddleware } from "./middlewares/authMiddleware.js";

import { dynamicViewsMiddleware } from "./middlewares/dynamicViews.js";

import { connectDB } from "./db.js";

import { configDotenv } from "dotenv";
configDotenv();

// Import routes
import {
  authRoutes,
  rolRoutes,
  transportRoutes,
  entrepreneurshipRoutes,
  announcementRoutes,
  reportRoutes,
} from "./routes/index.js";

// Initial configuration
const app = configureServer();
const port = process.env.PORT || 3000;

// Middleware
app.use(authMiddleware());
app.use(dynamicViewsMiddleware(app.get("views")));

// Connect to DB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/rol", rolRoutes);
app.use("/transport", transportRoutes);
app.use("/entrepreneurship", entrepreneurshipRoutes);
app.use("/announcement", announcementRoutes);
app.use("/report", reportRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error("[App Error]", err.stack);
  res.status(500).render("error", { error: err });
});

// 404 page
app.use((req, res) => {
  res.status(404).render("404");
});

// Initialize
startServer(app, port);
