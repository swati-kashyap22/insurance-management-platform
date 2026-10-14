const express = require("express");

const {
  uploadDocument,
  getDocuments,
  downloadDocument,
} = require("../controllers/documentController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const upload = require("../uploadMiddleware");

const router = express.Router();


// ========================================
// UPLOAD DOCUMENT
// ========================================

router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  uploadDocument
);


// ========================================
// GET CUSTOMER DOCUMENTS
// ========================================

router.get(
  "/customer/:customerId",
  authenticate,
  getDocuments
);


// ========================================
// DOWNLOAD DOCUMENT
// ========================================

router.get(
  "/:id/download",
  authenticate,
  downloadDocument
);


module.exports = router;