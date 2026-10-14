const express = require("express");

const {
  createPolicy,
  getActivePolicies,
  getMyPolicies,
  renewPolicy,
  cancelPolicy,
  getPolicyExpiryNotifications,
} = require("../controllers/policyController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Customer: view own policies
router.get(
  "/my-policies",
  authenticate,
  authorize("CUSTOMER"),
  getMyPolicies
);

// Admin/Agent: view all active policies
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "AGENT"),
  getActivePolicies
);

// Admin/Agent: policy expiry notifications
router.get(
  "/expiry-notifications",
  authenticate,
  authorize("ADMIN", "AGENT"),
  getPolicyExpiryNotifications
);

// Admin/Agent: create policy
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "AGENT"),
  createPolicy
);

// Admin/Agent: renew policy
router.put(
  "/:id/renew",
  authenticate,
  authorize("ADMIN", "AGENT"),
  renewPolicy
);

// Admin/Agent: cancel policy
router.put(
  "/:id/cancel",
  authenticate,
  authorize("ADMIN", "AGENT"),
  cancelPolicy
);

module.exports = router;