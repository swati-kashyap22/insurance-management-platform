const express = require("express");

const {
  recordPayment,
  createPendingPremium,
  getPaymentHistory,
  getOverduePayments,
} = require("../controllers/premiumController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ========================================
// RECORD PAID PREMIUM
// ========================================

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "AGENT"),
  recordPayment
);


// ========================================
// CREATE PENDING PREMIUM
// ========================================

router.post(
  "/pending",
  authenticate,
  authorize("ADMIN", "AGENT"),
  createPendingPremium
);


// ========================================
// PAYMENT HISTORY
// ========================================

router.get(
  "/policy/:policyId",
  authenticate,
  getPaymentHistory
);


// ========================================
// OVERDUE PREMIUM PAYMENTS
// ========================================

router.get(
  "/overdue",
  authenticate,
  authorize("ADMIN", "AGENT"),
  getOverduePayments
);


module.exports = router;