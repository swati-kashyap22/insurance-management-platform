const express = require("express");

const {
  getDashboardReports,
} = require("../controllers/reportController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Dashboard reports
router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN", "AGENT"),
  getDashboardReports
);

module.exports = router;