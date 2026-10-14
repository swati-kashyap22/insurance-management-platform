const prisma = require("../prisma");

// ========================================
// REPORTS DASHBOARD
// ========================================

const getDashboardReports = async (req, res) => {
  try {
    // -----------------------------
    // CUSTOMER COUNT
    // -----------------------------

    const totalCustomers = await prisma.customer.count();

    // -----------------------------
    // POLICY STATISTICS
    // -----------------------------

    const activePolicies = await prisma.policy.count({
      where: {
        status: "ACTIVE",
      },
    });

    const expiredPolicies = await prisma.policy.count({
      where: {
        status: "EXPIRED",
      },
    });

    // -----------------------------
    // CLAIM STATISTICS
    // -----------------------------

    const totalClaims = await prisma.claim.count();

    const pendingClaims = await prisma.claim.count({
      where: {
        status: "PENDING",
      },
    });

    const underReviewClaims = await prisma.claim.count({
      where: {
        status: "UNDER_REVIEW",
      },
    });

    const approvedClaims = await prisma.claim.count({
      where: {
        status: "APPROVED",
      },
    });

    const rejectedClaims = await prisma.claim.count({
      where: {
        status: "REJECTED",
      },
    });

    // -----------------------------
    // PREMIUM COLLECTION
    // -----------------------------

    const premiumPayments = await prisma.premiumPayment.findMany({
      where: {
        status: "PAID",
      },
      select: {
        amount: true,
      },
    });

    const totalPremiumCollection = premiumPayments.reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

    // -----------------------------
    // PENDING / OVERDUE PREMIUMS
    // -----------------------------

    const pendingPremiums = await prisma.premiumPayment.count({
      where: {
        status: "PENDING",
      },
    });

    const overduePremiums = await prisma.premiumPayment.count({
      where: {
        status: "OVERDUE",
      },
    });

    // -----------------------------
    // CUSTOMER GROWTH
    // -----------------------------

    const customers = await prisma.customer.findMany({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const customerGrowth = {};

    customers.forEach((customer) => {
      const date = new Date(customer.createdAt);

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!customerGrowth[month]) {
        customerGrowth[month] = 0;
      }

      customerGrowth[month]++;
    });

    // -----------------------------
    // MONTHLY PREMIUM COLLECTION
    // -----------------------------

    const paidPayments = await prisma.premiumPayment.findMany({
      where: {
        status: "PAID",
      },
      select: {
        amount: true,
        paymentDate: true,
      },
      orderBy: {
        paymentDate: "asc",
      },
    });

    const monthlyPremiumCollection = {};

    paidPayments.forEach((payment) => {
      const date = new Date(payment.paymentDate);

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyPremiumCollection[month]) {
        monthlyPremiumCollection[month] = 0;
      }

      monthlyPremiumCollection[month] += Number(payment.amount);
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------

    res.json({
      message: "Dashboard reports retrieved successfully",

      reports: {
        customers: {
          total: totalCustomers,
          growth: customerGrowth,
        },

        policies: {
          active: activePolicies,
          expired: expiredPolicies,
        },

        claims: {
          total: totalClaims,
          pending: pendingClaims,
          underReview: underReviewClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
        },

        premiums: {
          totalCollection: totalPremiumCollection,
          pending: pendingPremiums,
          overdue: overduePremiums,
          monthlyCollection: monthlyPremiumCollection,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard reports error:", error);

    res.status(500).json({
      message: "Server error while generating dashboard reports",
    });
  }
};

module.exports = {
  getDashboardReports,
};