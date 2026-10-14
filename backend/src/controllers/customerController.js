const prisma = require("../prisma");

// ===============================
// GET MY PROFILE
// ===============================

const getMyProfile = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        userId: req.user.userId,
      },
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
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer profile not found",
      });
    }

    res.json({
      message: "Customer profile retrieved successfully",
      customer,
    });
  } catch (error) {
    console.error("Get customer profile error:", error);

    res.status(500).json({
      message: "Server error while retrieving customer profile",
    });
  }
};


// ===============================
// UPDATE MY PROFILE
// ===============================

const updateMyProfile = async (req, res) => {
  try {
    const { phone, address, dateOfBirth } = req.body;

    const updateData = {};

    // Update phone only if provided
    if (Object.prototype.hasOwnProperty.call(req.body, "phone")) {
      updateData.phone = phone;
    }

    // Update address only if provided
    if (Object.prototype.hasOwnProperty.call(req.body, "address")) {
      updateData.address = address;
    }

    // Update date of birth only if provided
    if (Object.prototype.hasOwnProperty.call(req.body, "dateOfBirth")) {
      if (dateOfBirth === null || dateOfBirth === "") {
        updateData.dateOfBirth = null;
      } else {
        const parsedDate = new Date(dateOfBirth);

        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            message: "Invalid dateOfBirth",
          });
        }

        updateData.dateOfBirth = parsedDate;
      }
    }

    const customer = await prisma.customer.update({
      where: {
        userId: req.user.userId,
      },
      data: updateData,
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
    });

    res.json({
      message: "Customer profile updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer profile error:", error);

    res.status(500).json({
      message: "Server error while updating customer profile",
    });
  }
};


// ===============================
// SEARCH CUSTOMERS
// ===============================

const searchCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              {
                user: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                phone: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {},

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

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      message: "Customers retrieved successfully",
      customers,
    });
  } catch (error) {
    console.error("Search customers error:", error);

    res.status(500).json({
      message: "Server error while searching customers",
    });
  }
};


// ===============================
// GET CUSTOMER HISTORY
// ===============================

const getCustomerHistory = async (req, res) => {
  try {
    const customerId = Number(req.params.id);

    // Check whether customer ID is valid
    if (isNaN(customerId)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
      },

      include: {
        // Customer's basic user information
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        // Customer's policies
        policies: {
          include: {
            // Payments belonging to each policy
            payments: true,

            // Claims belonging to each policy
            claims: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        // Customer's claims
        claims: {
          include: {
            // Policy related to the claim
            policy: true,

            // Documents related to the claim
            documents: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        // Customer's uploaded documents
        documents: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Customer does not exist
    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json({
      message: "Customer history retrieved successfully",
      history: customer,
    });
  } catch (error) {
    console.error("Get customer history error:", error);

    res.status(500).json({
      message: "Server error while retrieving customer history",
    });
  }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================

module.exports = {
  getMyProfile,
  updateMyProfile,
  searchCustomers,
  getCustomerHistory,
};