const prisma = require("../prisma");


// ========================================
// SUBMIT INSURANCE CLAIM
// ========================================

const submitClaim = async (req, res) => {
  try {
    const {
      policyId,
      description,
      amount,
    } = req.body;

    if (!policyId || !description || !amount) {
      return res.status(400).json({
        message: "policyId, description and amount are required",
      });
    }

    const policyIdNumber = Number(policyId);

    if (isNaN(policyIdNumber)) {
      return res.status(400).json({
        message: "Invalid policyId",
      });
    }

    const policy = await prisma.policy.findUnique({
      where: {
        id: policyIdNumber,
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    if (policy.status !== "ACTIVE") {
      return res.status(400).json({
        message: "Claims can only be submitted for active policies",
      });
    }

    const claimAmount = Number(amount);

    if (isNaN(claimAmount) || claimAmount <= 0) {
      return res.status(400).json({
        message: "Claim amount must be a valid positive number",
      });
    }

    const claimNumber =
      `CLM-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const claim = await prisma.claim.create({
      data: {
        customerId: policy.customerId,
        policyId: policy.id,
        claimNumber,
        description,
        amount: claimAmount,
        status: "PENDING",
      },

      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            status: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Insurance claim submitted successfully",
      claim,
    });
  } catch (error) {
    console.error("Submit claim error:", error);

    res.status(500).json({
      message: "Server error while submitting insurance claim",
    });
  }
};


// ========================================
// GET CLAIM HISTORY
// ========================================

const getClaimHistory = async (req, res) => {
  try {
    let claims;

    // CUSTOMER can only see their own claims
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

      claims = await prisma.claim.findMany({
        where: {
          customerId: customer.id,
        },

        include: {
          policy: {
            select: {
              id: true,
              policyNumber: true,
              policyType: true,
              status: true,
            },
          },

          documents: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // ADMIN and AGENT can see all claims
    else if (
      req.user.role === "ADMIN" ||
      req.user.role === "AGENT"
    ) {
      claims = await prisma.claim.findMany({
        include: {
          customer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },

          policy: {
            select: {
              id: true,
              policyNumber: true,
              policyType: true,
              status: true,
            },
          },

          documents: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    }

    else {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json({
      message: "Claim history retrieved successfully",
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Get claim history error:", error);

    res.status(500).json({
      message: "Server error while retrieving claim history",
    });
  }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

// ========================================
// VERIFY / START CLAIM REVIEW
// ========================================

const verifyClaim = async (req, res) => {
  try {
    const claimId = Number(req.params.id);

    if (isNaN(claimId)) {
      return res.status(400).json({
        message: "Invalid claim ID",
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

    if (claim.status !== "PENDING") {
      return res.status(400).json({
        message:
          "Only pending claims can be moved to under review",
      });
    }

    const updatedClaim = await prisma.claim.update({
      where: {
        id: claimId,
      },

      data: {
        status: "UNDER_REVIEW",
      },

      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            status: true,
          },
        },

        documents: true,
      },
    });

    res.json({
      message: "Claim moved to under review successfully",
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Verify claim error:", error);

    res.status(500).json({
      message: "Server error while verifying claim",
    });
  }
};

// ========================================
// APPROVE OR REJECT CLAIM
// ========================================

const updateClaimDecision = async (req, res) => {
  try {
    const claimId = Number(req.params.id);

    if (isNaN(claimId)) {
      return res.status(400).json({
        message: "Invalid claim ID",
      });
    }

    const { decision } = req.body;

    if (!decision) {
      return res.status(400).json({
        message: "decision is required",
      });
    }

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return res.status(400).json({
        message: "Decision must be APPROVED or REJECTED",
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

    if (claim.status !== "UNDER_REVIEW") {
      return res.status(400).json({
        message:
          "Only claims under review can be approved or rejected",
      });
    }

    const updatedClaim = await prisma.claim.update({
      where: {
        id: claimId,
      },

      data: {
        status: decision,
      },

      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },

        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            status: true,
          },
        },

        documents: true,
      },
    });

    res.json({
      message: `Claim ${decision.toLowerCase()} successfully`,
      claim: updatedClaim,
    });
  } catch (error) {
    console.error("Update claim decision error:", error);

    res.status(500).json({
      message: "Server error while updating claim decision",
    });
  }
};


module.exports = {
  submitClaim,
  getClaimHistory,
  verifyClaim,
  updateClaimDecision,
};