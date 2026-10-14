const prisma = require("../prisma");

// ========================================
// CREATE INSURANCE POLICY
// ========================================

const createPolicy = async (req, res) => {
  try {
    const {
      customerId,
      policyType,
      premiumAmount,
      startDate,
      endDate,
    } = req.body;

    if (
      !customerId ||
      !policyType ||
      !premiumAmount ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "customerId, policyType, premiumAmount, startDate and endDate are required",
      });
    }

    const customerIdNumber = Number(customerId);

    if (isNaN(customerIdNumber)) {
      return res.status(400).json({
        message: "Invalid customerId",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerIdNumber,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const premium = Number(premiumAmount);

    if (isNaN(premium) || premium <= 0) {
      return res.status(400).json({
        message: "Premium amount must be a valid positive number",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid startDate or endDate",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message: "endDate must be after startDate",
      });
    }

    const policyNumber =
      `POL-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    const policy = await prisma.policy.create({
      data: {
        policyNumber,
        customerId: customerIdNumber,
        policyType,
        premiumAmount: premium,
        startDate: start,
        endDate: end,
        status: "ACTIVE",
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
      },
    });

    res.status(201).json({
      message: "Insurance policy created successfully",
      policy,
    });
  } catch (error) {
    console.error("Create policy error:", error);

    res.status(500).json({
      message: "Server error while creating insurance policy",
    });
  }
};


// ========================================
// VIEW ACTIVE POLICIES
// ========================================

const getActivePolicies = async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      where: {
        status: "ACTIVE",
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

      orderBy: {
        createdAt: "desc",
      },
    });


    res.json({
      message: "Active policies retrieved successfully",
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("Get active policies error:", error);

    res.status(500).json({
      message: "Server error while retrieving active policies",
    });
  }
};

// ========================================
// VIEW MY POLICIES - CUSTOMER
// ========================================

const getMyPolicies = async (req, res) => {
  try {
    const userId = Number(req.user.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        userId,
      },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found",
      });
    }

    const policies = await prisma.policy.findMany({
      where: {
        customerId: customer.id,
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
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Your policies retrieved successfully",
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("Get my policies error:", error);

    res.status(500).json({
      message: "Server error while retrieving your policies",
    });
  }
};


// ========================================
// RENEW POLICY
// ========================================

const renewPolicy = async (req, res) => {
  try {
    const policyId = Number(req.params.id);

    if (isNaN(policyId)) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const { newEndDate } = req.body;

    if (!newEndDate) {
      return res.status(400).json({
        message: "newEndDate is required",
      });
    }

    const existingPolicy = await prisma.policy.findUnique({
      where: {
        id: policyId,
      },
    });

    if (!existingPolicy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    if (existingPolicy.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cancelled policy cannot be renewed",
      });
    }

    const newEnd = new Date(newEndDate);

    if (isNaN(newEnd.getTime())) {
      return res.status(400).json({
        message: "Invalid newEndDate",
      });
    }

    if (newEnd <= existingPolicy.endDate) {
      return res.status(400).json({
        message: "New end date must be after the current policy end date",
      });
    }

    const renewedPolicy = await prisma.policy.update({
      where: {
        id: policyId,
      },

      data: {
        endDate: newEnd,
        status: "ACTIVE",
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
      },
    });

    res.json({
      message: "Policy renewed successfully",
      policy: renewedPolicy,
    });
  } catch (error) {
    console.error("Renew policy error:", error);

    res.status(500).json({
      message: "Server error while renewing policy",
    });
  }
};


// ========================================
// CANCEL POLICY
// ========================================

const cancelPolicy = async (req, res) => {
  try {
    const policyId = Number(req.params.id);

    if (isNaN(policyId)) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const existingPolicy = await prisma.policy.findUnique({
      where: {
        id: policyId,
      },
    });

    if (!existingPolicy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    if (existingPolicy.status === "CANCELLED") {
      return res.status(400).json({
        message: "Policy is already cancelled",
      });
    }

    const cancelledPolicy = await prisma.policy.update({
      where: {
        id: policyId,
      },

      data: {
        status: "CANCELLED",
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
      },
    });

    res.json({
      message: "Policy cancelled successfully",
      policy: cancelledPolicy,
    });
  } catch (error) {
    console.error("Cancel policy error:", error);

    res.status(500).json({
      message: "Server error while cancelling policy",
    });
  }
};


// ========================================
// POLICY EXPIRY NOTIFICATIONS
// ========================================

const getPolicyExpiryNotifications = async (req, res) => {
  try {
    const now = new Date();

    // 30 days from today
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const policies = await prisma.policy.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: thirtyDaysFromNow,
        },
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
      },

      orderBy: {
        endDate: "asc",
      },
    });

    const notifications = policies.map((policy) => {
      const expiryDate = new Date(policy.endDate);

      let notificationType;

      if (expiryDate < now) {
        notificationType = "EXPIRED";
      } else {
        notificationType = "EXPIRING_SOON";
      }

      return {
        policyId: policy.id,
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        customer: policy.customer.user,
        expiryDate: policy.endDate,
        notificationType,
      };
    });

    res.json({
      message: "Policy expiry notifications retrieved successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Policy expiry notification error:", error);

    res.status(500).json({
      message:
        "Server error while retrieving policy expiry notifications",
    });
  }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
  createPolicy,
  getActivePolicies,
  getMyPolicies,
  renewPolicy,
  cancelPolicy,
  getPolicyExpiryNotifications,
};