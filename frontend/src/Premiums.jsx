import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function Premiums() {
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [overduePayments, setOverduePayments] = useState([]);

  const [showPaidForm, setShowPaidForm] = useState(false);
  const [showPendingForm, setShowPendingForm] = useState(false);

  const [policyId, setPolicyId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [selectedPolicyId, setSelectedPolicyId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [loadingOverdue, setLoadingOverdue] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // CURRENT USER / ROLE
  // ========================================

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const isCustomer = role === "CUSTOMER";
  const isAdminOrAgent = role === "ADMIN" || role === "AGENT";

  // ========================================
  // LOAD POLICIES
  // ========================================

  const loadPolicies = async () => {
    try {
      setLoadingPolicies(true);
      setError("");

      // Customer -> own policies
      // Admin / Agent -> all active policies
      const endpoint = isCustomer
        ? "/policies/my-policies"
        : "/policies";

      const data = await apiRequest(endpoint);

      setPolicies(data.policies || []);
    } catch (error) {
      setError(error.message);
      setPolicies([]);
    } finally {
      setLoadingPolicies(false);
    }
  };

  // ========================================
  // LOAD PAYMENT HISTORY
  // ========================================

  const loadPayments = async (policy) => {
    if (!policy) {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(
        `/premiums/policy/${policy}`
      );

      setPayments(data.payments || []);
    } catch (error) {
      setError(error.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD OVERDUE PAYMENTS
  // ADMIN / AGENT ONLY
  // ========================================

  const loadOverduePayments = async () => {
    if (!isAdminOrAgent) {
      setOverduePayments([]);
      return;
    }

    try {
      setLoadingOverdue(true);

      const data = await apiRequest("/premiums/overdue");

      setOverduePayments(data.payments || []);
    } catch (error) {
      setError(error.message);
      setOverduePayments([]);
    } finally {
      setLoadingOverdue(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadPolicies();

    if (isAdminOrAgent) {
      loadOverduePayments();
    }
  }, []);

  // ========================================
  // WHEN POLICY CHANGES
  // ========================================

  useEffect(() => {
    if (selectedPolicyId) {
      loadPayments(selectedPolicyId);
    } else {
      setPayments([]);
    }
  }, [selectedPolicyId]);

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setPolicyId("");
    setAmount("");
    setDueDate("");
    setPaymentDate("");
    setTransactionId("");
  };

  // ========================================
  // RECORD PAID PAYMENT
  // ADMIN / AGENT ONLY
  // ========================================

  const handleRecordPayment = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const selectedPolicy = policyId;

      const data = await apiRequest("/premiums", {
        method: "POST",
        body: JSON.stringify({
          policyId: Number(policyId),
          amount: Number(amount),
          dueDate,
          paymentDate: paymentDate || undefined,
          transactionId: transactionId || undefined,
        }),
      });

      setSuccess(data.message);

      resetForm();

      setShowPaidForm(false);

      await loadPayments(selectedPolicy);
      await loadOverduePayments();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // CREATE PENDING PREMIUM
  // ADMIN / AGENT ONLY
  // ========================================

  const handleCreatePending = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const selectedPolicy = policyId;

      const data = await apiRequest("/premiums/pending", {
        method: "POST",
        body: JSON.stringify({
          policyId: Number(policyId),
          amount: Number(amount),
          dueDate,
        }),
      });

      setSuccess(data.message);

      resetForm();

      setShowPendingForm(false);

      await loadPayments(selectedPolicy);
      await loadOverduePayments();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (status) => {
    if (status === "PAID") {
      return "bg-green-100 text-green-700";
    }

    if (status === "OVERDUE") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  // ========================================
  // PAYMENT TOTALS
  // ========================================

  const totalPaid = payments
    .filter((payment) => payment.status === "PAID")
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  const totalPending = payments
    .filter((payment) => payment.status === "PENDING")
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  const totalOverdue = payments
    .filter((payment) => payment.status === "OVERDUE")
    .reduce(
      (total, payment) => total + Number(payment.amount),
      0
    );

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        {/* HEADER */}

        <header className="bg-white shadow-sm">

          <div className="px-8 py-5 flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                Premiums
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {isCustomer
                  ? "View your premium payments and payment status"
                  : "Track and manage premium payments"}
              </p>

            </div>

            {/* ADMIN / AGENT ACTIONS */}

            {isAdminOrAgent && (
              <div className="flex gap-3">

                <button
                  onClick={() => {
                    setShowPaidForm(!showPaidForm);
                    setShowPendingForm(false);
                    setError("");
                    setSuccess("");
                    loadPolicies();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-lg"
                >
                  {showPaidForm
                    ? "Close"
                    : "Record Payment"}
                </button>

                <button
                  onClick={() => {
                    setShowPendingForm(!showPendingForm);
                    setShowPaidForm(false);
                    setError("");
                    setSuccess("");
                    loadPolicies();
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-3 rounded-lg"
                >
                  {showPendingForm
                    ? "Close"
                    : "Create Pending"}
                </button>

              </div>
            )}

          </div>

        </header>

        <main className="p-8">

          {/* SUCCESS */}

          {success && (
            <div className="bg-green-100 text-green-700 rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* ========================================
              ADMIN / AGENT - RECORD PAYMENT
          ======================================== */}

          {isAdminOrAgent && showPaidForm && (

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Record Premium Payment
              </h2>

              {loadingPolicies ? (

                <p className="text-gray-500">
                  Loading policies...
                </p>

              ) : (

                <form
                  onSubmit={handleRecordPayment}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Policy
                    </label>

                    <select
                      value={policyId}
                      onChange={(e) =>
                        setPolicyId(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="">
                        Select a policy
                      </option>

                      {policies.map((policy) => (

                        <option
                          key={policy.id}
                          value={policy.id}
                        >
                          {policy.policyNumber} —{" "}
                          {policy.policyType} — ₹
                          {Number(
                            policy.premiumAmount
                          ).toLocaleString()}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="Enter amount"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) =>
                        setDueDate(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date
                    </label>

                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) =>
                        setPaymentDate(e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID
                    </label>

                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) =>
                        setTransactionId(e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                    >
                      {submitting
                        ? "Recording..."
                        : "Record Payment"}
                    </button>

                  </div>

                </form>

              )}

            </div>

          )}

          {/* ========================================
              ADMIN / AGENT - CREATE PENDING
          ======================================== */}

          {isAdminOrAgent && showPendingForm && (

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Create Pending Premium
              </h2>

              {loadingPolicies ? (

                <p className="text-gray-500">
                  Loading policies...
                </p>

              ) : (

                <form
                  onSubmit={handleCreatePending}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >

                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Policy
                    </label>

                    <select
                      value={policyId}
                      onChange={(e) =>
                        setPolicyId(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >

                      <option value="">
                        Select a policy
                      </option>

                      {policies.map((policy) => (

                        <option
                          key={policy.id}
                          value={policy.id}
                        >
                          {policy.policyNumber} —{" "}
                          {policy.policyType} — ₹
                          {Number(
                            policy.premiumAmount
                          ).toLocaleString()}
                        </option>

                      ))}

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="Enter amount"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) =>
                        setDueDate(e.target.value)
                      }
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <div className="md:col-span-2">

                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                    >
                      {submitting
                        ? "Creating..."
                        : "Create Pending Premium"}
                    </button>

                  </div>

                </form>

              )}

            </div>

          )}

          {/* ========================================
              PAYMENT SUMMARY
          ======================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Total Paid
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹{totalPaid.toLocaleString()}
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="text-3xl font-bold text-yellow-600 mt-2">
                ₹{totalPending.toLocaleString()}
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Overdue
              </p>

              <p className="text-3xl font-bold text-red-600 mt-2">
                ₹{totalOverdue.toLocaleString()}
              </p>

            </div>

          </div>

          {/* ========================================
              POLICY SELECTOR
          ======================================== */}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              View Payment History
            </label>

            {loadingPolicies ? (

              <p className="text-gray-500">
                Loading policies...
              </p>

            ) : (

              <select
                value={selectedPolicyId}
                onChange={(e) =>
                  setSelectedPolicyId(e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >

                <option value="">
                  Select a policy to view payments
                </option>

                {policies.map((policy) => (

                  <option
                    key={policy.id}
                    value={policy.id}
                  >
                    {policy.policyNumber} —{" "}
                    {policy.policyType}
                  </option>

                ))}

              </select>

            )}

          </div>

          {/* ========================================
              PAYMENT HISTORY
          ======================================== */}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">

            <div className="px-6 py-5 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                Payment History
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {selectedPolicyId
                  ? "Payments for the selected policy"
                  : "Select a policy above"}
              </p>

            </div>

            {!selectedPolicyId ? (

              <div className="p-8 text-center text-gray-500">
                Select a policy to view payment history.
              </div>

            ) : loading ? (

              <div className="p-8 text-center text-gray-500">
                Loading payment history...
              </div>

            ) : payments.length === 0 ? (

              <div className="p-8 text-center text-gray-500">
                No payment records found.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        ID
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Amount
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Due Date
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Payment Date
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Transaction ID
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {payments.map((payment) => (

                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {payment.id}
                        </td>

                        <td className="px-5 py-4 text-gray-700">
                          ₹
                          {Number(
                            payment.amount
                          ).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {new Date(
                            payment.dueDate
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {payment.paymentDate
                            ? new Date(
                                payment.paymentDate
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {payment.transactionId || "-"}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* ========================================
              OVERDUE ALERTS
              ADMIN / AGENT ONLY
          ======================================== */}

          {isAdminOrAgent && (

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">

              <div className="px-6 py-5 border-b">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-gray-800">
                      Overdue Premium Alerts
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Premium payments that have passed their due date
                    </p>

                  </div>

                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {overduePayments.length} overdue
                  </span>

                </div>

              </div>

              {loadingOverdue ? (

                <div className="p-8 text-center text-gray-500">
                  Checking overdue payments...
                </div>

              ) : overduePayments.length === 0 ? (

                <div className="p-8 text-center text-gray-500">
                  No overdue premium payments.
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead className="bg-red-50">

                      <tr>

                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Policy
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Customer
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Amount
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Due Date
                        </th>

                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y">

                      {overduePayments.map((payment) => (

                        <tr
                          key={payment.id}
                          className="hover:bg-red-50"
                        >

                          <td className="px-5 py-4 font-semibold text-gray-800">
                            {payment.policy?.policyNumber || "-"}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {payment.policy?.customer?.user?.name || "-"}
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            ₹
                            {Number(
                              payment.amount
                            ).toLocaleString()}
                          </td>

                          <td className="px-5 py-4 text-red-600 font-semibold">
                            {new Date(
                              payment.dueDate
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-4">

                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                              {payment.status}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </main>

      </div>

    </div>
  );
}

export default Premiums;