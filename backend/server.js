const documentRoutes = require("./src/routes/documentRoutes");
const premiumRoutes = require("./src/routes/premiumRoutes");

const reportRoutes = require("./src/routes/reportRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./src/prisma");

const authRoutes = require("./src/routes/authRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const policyRoutes = require("./src/routes/policyRoutes");
const claimRoutes = require("./src/routes/claimRoutes");

const {
  authenticate,
  authorize,
} = require("./src/middleware/authMiddleware");

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());



// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/premiums", premiumRoutes);
app.use("/api/reports", reportRoutes);


// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "Insurance Management Platform API is running",
  });
});


// ========================================
// DATABASE HEALTH CHECK
// ========================================

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});


// ========================================
// PROTECTED TEST ROUTE
// ========================================

app.get("/api/protected", authenticate, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: req.user,
  });
});


// ========================================
// ADMIN-ONLY TEST ROUTE
// ========================================

app.get(
  "/api/admin-test",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.json({
      message: "You have ADMIN access",
      user: req.user,
    });
  }
);


// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});