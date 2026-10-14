import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function Policies() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const isAdminOrAgent = role === "ADMIN" || role === "AGENT";
  const isCustomer = role === "CUSTOMER";

  const [policies, setPolicies] = useState([]);
  const [expiryNotifications, setExpiryNotifications] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // LOAD POLICIES
  // ========================================

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (isCustomer) {
        data = await apiRequest("/policies/my-policies");
      } else {
        data = await apiRequest("/policies");
      }

      setPolicies(data.policies || []);
    } catch (error) {
      console.error("Load policies error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD EXPIRY NOTIFICATIONS
  // ADMIN / AGENT ONLY
  // ========================================

  const loadExpiryNotifications = async () => {
    if (!isAdminOrAgent) {
      return;
    }

    try {
      const data = await apiRequest(
        "/policies/expiry-notifications"
      );

      setExpiryNotifications(data.notifications || []);
    } catch (error) {
      console.error("Expiry notification error:", error);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadPolicies();
    loadExpiryNotifications();
  }, []);

  // ========================================
  // CREATE POLICY
  // ADMIN / AGENT ONLY
  // ========================================

  const handleCreatePolicy = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const data = await apiRequest("/policies", {
        method: "POST",
        body: JSON.stringify({
          customerId: Number(customerId),
          policyType,
          premiumAmount: Number(premiumAmount),
          startDate,
          endDate,
        }),
      });

      setSuccess(data.message);

      setCustomerId("");
      setPolicyType("");
      setPremiumAmount("");
      setStartDate("");
      setEndDate("");

      setShowCreateForm(false);

      await loadPolicies();
      await loadExpiryNotifications();
    } catch (error) {
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  // ========================================
  // RENEW POLICY
  // ADMIN / AGENT ONLY
  // ========================================

  const handleRenew = async (policyId) => {
    const newEndDate = window.prompt(
      "Enter new end date (YYYY-MM-DD):"
    );

    if (!newEndDate) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/policies/${policyId}/renew`,
        {
          method: "PUT",
          body: JSON.stringify({
            newEndDate,
          }),
        }
      );

      setSuccess(data.message);

      await loadPolicies();
      await loadExpiryNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  // ========================================
  // CANCEL POLICY
  // ADMIN / AGENT ONLY
  // ========================================

  const handleCancel = async (policyId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this policy?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/policies/${policyId}/cancel`,
        {
          method: "PUT",
        }
      );

      setSuccess(data.message);

      await loadPolicies();
      await loadExpiryNotifications();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        {/* ========================================
            HEADER
        ======================================== */}

        <header className="bg-white shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Policies
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {isCustomer
                  ? "View your insurance policies"
                  : "Manage insurance policies"}
              </p>
            </div>

            {isAdminOrAgent && (
              <button
                onClick={() =>
                  setShowCreateForm(!showCreateForm)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg"
              >
                {showCreateForm
                  ? "Close Form"
                  : "Create Policy"}
              </button>
            )}

          </div>
        </header>

        <main className="p-8">

          {/* ========================================
              SUCCESS MESSAGE
          ======================================== */}

          {success && (
            <div className="bg-green-100 text-green-700 rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {/* ========================================
              ERROR MESSAGE
          ======================================== */}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* ========================================
              CREATE POLICY FORM
              ADMIN / AGENT ONLY
          ======================================== */}

          {isAdminOrAgent && showCreateForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Create Insurance Policy
              </h2>

              <form
                onSubmit={handleCreatePolicy}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >

                {/* CUSTOMER ID */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer ID
                  </label>

                  <input
                    type="number"
                    value={customerId}
                    onChange={(e) =>
                      setCustomerId(e.target.value)
                    }
                    placeholder="Enter customer ID"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* POLICY TYPE */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type
                  </label>

                  <input
                    type="text"
                    value={policyType}
                    onChange={(e) =>
                      setPolicyType(e.target.value)
                    }
                    placeholder="e.g. Health Insurance"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PREMIUM */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premium Amount
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={premiumAmount}
                    onChange={(e) =>
                      setPremiumAmount(e.target.value)
                    }
                    placeholder="Enter premium amount"
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* START DATE */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* END DATE */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* BUTTON */}

                <div className="md:col-span-2">

                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                  >
                    {creating
                      ? "Creating..."
                      : "Create Policy"}
                  </button>

                </div>

              </form>

            </div>
          )}

          {/* ========================================
              EXPIRY NOTIFICATIONS
              ADMIN / AGENT ONLY
          ======================================== */}

          {isAdminOrAgent && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Policy Expiry Notifications
              </h2>

              {expiryNotifications.length === 0 ? (
                <p className="text-gray-500">
                  No policies are expiring within the next 30 days.
                </p>
              ) : (
                <div className="space-y-3">

                  {expiryNotifications.map(
                    (notification) => (
                      <div
                        key={notification.policyId}
                        className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                      >

                        <div className="flex justify-between">

                          <div>
                            <p className="font-semibold text-gray-800">
                              {notification.policyNumber}
                            </p>

                            <p className="text-sm text-gray-600">
                              {notification.customer?.name}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-yellow-700">
                            {notification.notificationType}
                          </span>

                        </div>

                        <p className="text-sm text-gray-600 mt-2">
                          Expiry:{" "}
                          {new Date(
                            notification.expiryDate
                          ).toLocaleDateString()}
                        </p>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

          {/* ========================================
              POLICY LIST
          ======================================== */}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                {isCustomer
                  ? "My Policies"
                  : "Active Policies"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {policies.length}{" "}
                {isCustomer
                  ? "policy(s)"
                  : "active policy(s)"}
              </p>

            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading policies...
              </div>
            ) : policies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {isCustomer
                  ? "You do not have any policies."
                  : "No active policies found."}
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Policy
                      </th>

                      {isAdminOrAgent && (
                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Customer
                        </th>
                      )}

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Type
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Premium
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Start
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        End
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                      {isAdminOrAgent && (
                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      )}

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {policies.map((policy) => (

                      <tr
                        key={policy.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {policy.policyNumber}
                        </td>

                        {isAdminOrAgent && (
                          <td className="px-5 py-4 text-gray-700">
                            {policy.customer?.user?.name || "-"}
                          </td>
                        )}

                        <td className="px-5 py-4 text-gray-600">
                          {policy.policyType}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          ₹
                          {Number(
                            policy.premiumAmount
                          ).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {new Date(
                            policy.startDate
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {new Date(
                            policy.endDate
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              policy.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : policy.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {policy.status}
                          </span>

                        </td>

                        {isAdminOrAgent && (
                          <td className="px-5 py-4">

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleRenew(policy.id)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Renew
                              </button>

                              <button
                                onClick={() =>
                                  handleCancel(policy.id)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                              >
                                Cancel
                              </button>

                            </div>

                          </td>
                        )}

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Policies;