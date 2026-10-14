const prisma = require("../prisma");

// ========================================
// RECORD PREMIUM PAYMENT
// ========================================

const recordPayment = async (req, res) => {
  try {
    const {
      policyId,
      amount,
      dueDate,
      paymentDate,
      transactionId,
    } = req.body;

    if (!policyId || !amount || !dueDate) {
      return res.status(400).json({
        message: "policyId, amount and dueDate are required",
      });
    }

    const policyIdNumber = Number(policyId);
    const paymentAmount = Number(amount);

    if (isNaN(policyIdNumber)) {
      return res.status(400).json({
        message: "Invalid policyId",
      });
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid positive number",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid dueDate",
      });
    }

    let parsedPaymentDate = new Date();

    if (paymentDate) {
      parsedPaymentDate = new Date(paymentDate);

      if (isNaN(parsedPaymentDate.getTime())) {
        return res.status(400).json({
          message: "Invalid paymentDate",
        });
      }
    }

    const policy = await prisma.policy.findUnique({
      where: {
        id: policyIdNumber,
      },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    if (policy.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot record payment for a cancelled policy",
      });
    }

    const payment = await prisma.premiumPayment.create({
      data: {
        policyId: policyIdNumber,
        amount: paymentAmount,
        dueDate: parsedDueDate,
        paymentDate: parsedPaymentDate,
        status: "PAID",
        transactionId: transactionId || null,
      },

      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            customerId: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Premium payment recorded successfully",
      payment,
    });
  } catch (error) {
    console.error("Record premium payment error:", error);

    res.status(500).json({
      message: "Server error while recording premium payment",
    });
  }
};


// ========================================
// CREATE PENDING PREMIUM
// ========================================

const createPendingPremium = async (req, res) => {
  try {
    const {
      policyId,
      amount,
      dueDate,
    } = req.body;

    if (!policyId || !amount || !dueDate) {
      return res.status(400).json({
        message: "policyId, amount and dueDate are required",
      });
    }

    const policyIdNumber = Number(policyId);
    const paymentAmount = Number(amount);

    if (isNaN(policyIdNumber)) {
      return res.status(400).json({
        message: "Invalid policyId",
      });
    }

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid positive number",
      });
    }

    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid dueDate",
      });
    }

    const policy = await prisma.policy.findUnique({
      where: {
        id: policyIdNumber,
      },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    if (policy.status === "CANCELLED") {
      return res.status(400).json({
        message: "Cannot create premium for a cancelled policy",
      });
    }

    const payment = await prisma.premiumPayment.create({
      data: {
        policyId: policyIdNumber,
        amount: paymentAmount,
        dueDate: parsedDueDate,
        status: "PENDING",
      },

      include: {
        policy: {
          select: {
            id: true,
            policyNumber: true,
            policyType: true,
            customerId: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Pending premium created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create pending premium error:", error);

    res.status(500).json({
      message: "Server error while creating pending premium",
    });
  }
};


// ========================================
// GET PAYMENT HISTORY
// ========================================

const getPaymentHistory = async (req, res) => {
  try {
    const policyId = Number(req.params.policyId);

    if (isNaN(policyId)) {
      return res.status(400).json({
        message: "Invalid policy ID",
      });
    }

    const policy = await prisma.policy.findUnique({
      where: {
        id: policyId,
      },
    });

    if (!policy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    // CUSTOMER can only view payment history
    // for their own policy.
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

      if (policy.customerId !== customer.id) {
        return res.status(403).json({
          message: "You can only view payment history for your own policies",
        });
      }
    }

    const payments = await prisma.premiumPayment.findMany({
      where: {
        policyId,
      },

      orderBy: {
        paymentDate: "desc",
      },
    });

    res.json({
      message: "Premium payment history retrieved successfully",
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payment history error:", error);

    res.status(500).json({
      message: "Server error while retrieving payment history",
    });
  }
};


// ========================================
// GET OVERDUE PAYMENTS
// ========================================

const getOverduePayments = async (req, res) => {
  try {
    const now = new Date();

    const overduePayments = await prisma.premiumPayment.findMany({
      where: {
        status: {
          in: ["PENDING", "OVERDUE"],
        },

        dueDate: {
          lt: now,
        },
      },

      include: {
        policy: {
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
        },
      },

      orderBy: {
        dueDate: "asc",
      },
    });

    const paymentIds = overduePayments
      .filter((payment) => payment.status === "PENDING")
      .map((payment) => payment.id);

    if (paymentIds.length > 0) {
      await prisma.premiumPayment.updateMany({
        where: {
          id: {
            in: paymentIds,
          },
        },

        data: {
          status: "OVERDUE",
        },
      });
    }

    // Return the updated records.
    const updatedPayments = await prisma.premiumPayment.findMany({
      where: {
        id: {
          in: overduePayments.map((payment) => payment.id),
        },
      },

      include: {
        policy: {
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
        },
      },

      orderBy: {
        dueDate: "asc",
      },
    });

    res.json({
      message: "Overdue premium payments retrieved successfully",
      count: updatedPayments.length,
      payments: updatedPayments,
    });
  } catch (error) {
    console.error("Get overdue payments error:", error);

    res.status(500).json({
      message: "Server error while retrieving overdue payments",
    });
  }
};


module.exports = {
  recordPayment,
  createPendingPremium,
  getPaymentHistory,
  getOverduePayments,
};