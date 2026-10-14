const express = require("express");

const {
  submitClaim,
  getClaimHistory,
  verifyClaim,
  updateClaimDecision,
} = require("../controllers/claimController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CLAIM HISTORY
// ========================================

router.get(
  "/history",
  authenticate,
  getClaimHistory
);


// ========================================
// VERIFY CLAIM
// ========================================

router.put(
  "/:id/verify",
  authenticate,
  authorize("ADMIN", "AGENT"),
  verifyClaim
);


// ========================================
// APPROVE OR REJECT CLAIM
// ========================================

router.put(
  "/:id/decision",
  authenticate,
  authorize("ADMIN", "AGENT"),
  updateClaimDecision
);


// ========================================
// SUBMIT INSURANCE CLAIM
// ========================================

router.post(
  "/",
  authenticate,
  submitClaim
);


module.exports = router;