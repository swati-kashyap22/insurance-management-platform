const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  searchCustomers,
  getCustomerHistory,
} = require("../controllers/customerController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CUSTOMER PROFILE ROUTES
// ========================================

// Logged-in customer can view their own profile
router.get(
  "/profile",
  authenticate,
  getMyProfile
);


// Logged-in customer can update their own profile
router.put(
  "/profile",
  authenticate,
  updateMyProfile
);


// ========================================
// ADMIN / AGENT CUSTOMER ROUTES
// ========================================

// ADMIN and AGENT can search customers
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AGENT"),
  searchCustomers
);


// ADMIN and AGENT can view a customer's complete history
router.get(
  "/:id/history",
  authenticate,
  authorize("ADMIN", "AGENT"),
  getCustomerHistory
);


module.exports = router;