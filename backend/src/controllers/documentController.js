const prisma = require("../prisma");


// ========================================
// UPLOAD DOCUMENT
// ========================================

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const customerId = Number(req.body.customerId);

    const claimId = req.body.claimId
      ? Number(req.body.claimId)
      : null;

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customerId",
      });
    }

    // ========================================
    // CUSTOMER PERMISSION CHECK
    // ========================================

    if (req.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: {
          userId: req.user.userId,
        },
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer profile not found",
        });
      }

      if (customer.id !== customerId) {
        return res.status(403).json({
          message: "You can only upload documents for your own account",
        });
      }
    }

    // ========================================
    // CHECK CUSTOMER EXISTS
    // ========================================

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // ========================================
    // CHECK CLAIM
    // ========================================

    if (claimId !== null) {
      if (isNaN(claimId)) {
        return res.status(400).json({
          message: "Invalid claimId",
        });
      }

      const claim = await prisma.claim.findUnique({
        where: {
          id: claimId,
        },
      });

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found",
        });
      }

      if (claim.customerId !== customerId) {
        return res.status(400).json({
          message: "Claim does not belong to the specified customer",
        });
      }
    }

    // ========================================
    // CREATE DOCUMENT RECORD
    // ========================================

    const document = await prisma.document.create({
      data: {
        customerId,
        claimId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
      },
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    res.status(500).json({
      message: "Server error while uploading document",
    });
  }
};


// ========================================
// GET DOCUMENTS
// ========================================

const getDocuments = async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    // ========================================
    // CUSTOMER PERMISSION CHECK
    // ========================================

    if (req.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: {
          userId: req.user.userId,
        },
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer profile not found",
        });
      }

      if (customer.id !== customerId) {
        return res.status(403).json({
          message: "You can only view your own documents",
        });
      }
    }

    // ========================================
    // GET DOCUMENTS
    // ========================================

    const documents = await prisma.document.findMany({
      where: {
        customerId,
      },

      include: {
        claim: {
          select: {
            id: true,
            claimNumber: true,
            status: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Documents retrieved successfully",
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Server error while retrieving documents",
    });
  }
};

// ========================================
// DOWNLOAD DOCUMENT
// ========================================

const downloadDocument = async (req, res) => {
  try {
    const documentId = Number(req.params.id);

    if (isNaN(documentId)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // CUSTOMER can only download their own documents
    if (req.user.role === "CUSTOMER") {
      const customer = await prisma.customer.findUnique({
        where: {
          userId: req.user.userId,
        },
      });

      if (!customer) {
        return res.status(404).json({
          message: "Customer profile not found",
        });
      }

      if (customer.id !== document.customerId) {
        return res.status(403).json({
          message: "You can only download your own documents",
        });
      }
    }

    res.download(
      document.filePath,
      document.fileName,
      (error) => {
        if (error) {
          console.error("Download document error:", error);

          if (!res.headersSent) {
            res.status(500).json({
              message: "Error while downloading document",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error("Download document error:", error);

    res.status(500).json({
      message: "Server error while downloading document",
    });
  }
};


module.exports = {
  uploadDocument,
  getDocuments,
  downloadDocument,
};