import { configureServer, startServer } from "./config/server.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { dynamicViewsMiddleware } from "./middlewares/dynamicViews.js";
import { connectDB } from "./db.js";
import { config } from "./config/env.js";

// Import routes
import {
  authRoutes,
  userRoutes,
  transportRoutes,
  entrepreneurshipRoutes,
  announcementRoutes,
  reportRoutes,
  eventRoutes,
} from "./routes/index.js";
import { initSession } from "./config/session.js";

// Initial configuration
const app = configureServer();
const port = config.PORT;

// Init session
initSession(app);

// Connect to DB
connectDB();

// Routes
app.use("/api/", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/entrepreneurship", entrepreneurshipRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/report", reportRoutes);

// Middleware
app.use(authMiddleware());
app.use(dynamicViewsMiddleware(app.get("views")));

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
