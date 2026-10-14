import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function Claims() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [policyId, setPolicyId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // GET CURRENT USER
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const isCustomer = role === "CUSTOMER";
  const isAdminOrAgent = role === "ADMIN" || role === "AGENT";

  // ========================================
  // LOAD CLAIMS
  // ========================================

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/claims/history");

      setClaims(data.claims || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD POLICIES
  // ========================================

  const loadPolicies = async () => {
    try {
      setLoadingPolicies(true);
      setError("");

      // CUSTOMER -> only own policies
      // ADMIN / AGENT -> all active policies
      const endpoint = isCustomer
        ? "/policies/my-policies"
        : "/policies";

      const data = await apiRequest(endpoint);

      setPolicies(data.policies || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingPolicies(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadClaims();
  }, []);

  // ========================================
  // LOAD POLICIES WHEN FORM OPENS
  // ========================================

  useEffect(() => {
    if (showForm) {
      loadPolicies();
    }
  }, [showForm]);

  // ========================================
  // SUBMIT CLAIM
  // ========================================

  const handleSubmitClaim = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = await apiRequest("/claims", {
        method: "POST",
        body: JSON.stringify({
          policyId: Number(policyId),
          description,
          amount: Number(amount),
        }),
      });

      setSuccess(data.message);

      setPolicyId("");
      setDescription("");
      setAmount("");

      setShowForm(false);

      await loadClaims();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ========================================
  // VERIFY CLAIM
  // ========================================

  const handleVerify = async (claimId) => {
    try {
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/claims/${claimId}/verify`,
        {
          method: "PUT",
        }
      );

      setSuccess(data.message);

      await loadClaims();
    } catch (error) {
      setError(error.message);
    }
  };

  // ========================================
  // APPROVE / REJECT CLAIM
  // ========================================

  const handleDecision = async (claimId, decision) => {
    const action =
      decision === "APPROVED" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this claim?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const data = await apiRequest(
        `/claims/${claimId}/decision`,
        {
          method: "PUT",
          body: JSON.stringify({
            decision,
          }),
        }
      );

      setSuccess(data.message);

      await loadClaims();
    } catch (error) {
      setError(error.message);
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (status) => {
    if (status === "APPROVED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "REJECTED") {
      return "bg-red-100 text-red-700";
    }

    if (status === "UNDER_REVIEW") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        {/* HEADER */}

        <header className="bg-white shadow-sm">

          <div className="px-8 py-5 flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                Claims
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                {isCustomer
                  ? "Submit and track your insurance claims"
                  : "Manage insurance claims and claim verification"}
              </p>

            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setSuccess("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg"
            >
              {showForm ? "Close Form" : "Submit Claim"}
            </button>

          </div>

        </header>

        <main className="p-8">

          {/* SUCCESS MESSAGE */}

          {success && (
            <div className="bg-green-100 text-green-700 rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* SUBMIT CLAIM FORM */}

          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Submit Insurance Claim
              </h2>

              {loadingPolicies ? (
                <p className="text-gray-500">
                  Loading active policies...
                </p>
              ) : policies.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3">
                  No active policies are available for claim
                  submission.
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitClaim}
                  className="space-y-5"
                >

                  {/* ACTIVE POLICY */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Active Policy
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
                        Select an active policy
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
                          {isAdminOrAgent &&
                            ` — ${
                              policy.customer?.user?.name ||
                              "Customer"
                            }`}
                        </option>
                      ))}

                    </select>

                    <p className="text-xs text-gray-500 mt-1">
                      Only active policies are available.
                    </p>

                  </div>

                  {/* DESCRIPTION */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      placeholder="Describe the reason for your claim..."
                      rows="4"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  {/* AMOUNT */}

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claim Amount
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="Enter claim amount"
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Claim"}
                  </button>

                </form>
              )}

            </div>
          )}

          {/* CLAIM STATISTICS */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Total Claims
              </p>

              <p className="text-3xl font-bold text-gray-800 mt-2">
                {claims.length}
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Pending
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {
                  claims.filter(
                    (claim) => claim.status === "PENDING"
                  ).length
                }
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Under Review
              </p>

              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {
                  claims.filter(
                    (claim) =>
                      claim.status === "UNDER_REVIEW"
                  ).length
                }
              </p>

            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">

              <p className="text-sm text-gray-500">
                Approved
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {
                  claims.filter(
                    (claim) => claim.status === "APPROVED"
                  ).length
                }
              </p>

            </div>

          </div>

          {/* CLAIM LIST */}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                Claim History
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {isCustomer
                  ? "View your submitted claims"
                  : "Review and manage submitted claims"}
              </p>

            </div>

            {loading ? (

              <div className="p-8 text-center text-gray-500">
                Loading claims...
              </div>

            ) : claims.length === 0 ? (

              <div className="p-8 text-center text-gray-500">
                No claims found.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Claim Number
                      </th>

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
                        Description
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Status
                      </th>

                      {!isCustomer && (
                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                          Actions
                        </th>
                      )}

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {claims.map((claim) => (

                      <tr
                        key={claim.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {claim.claimNumber}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {claim.policy?.policyNumber || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {claim.customer?.user?.name || "-"}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          ₹
                          {Number(
                            claim.amount
                          ).toLocaleString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600 max-w-xs">
                          {claim.description}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                              claim.status
                            )}`}
                          >
                            {claim.status}
                          </span>

                        </td>

                        {/* ADMIN / AGENT ACTIONS ONLY */}

                        {!isCustomer && (
                          <td className="px-5 py-4">

                            <div className="flex flex-wrap gap-2">

                              {claim.status === "PENDING" && (
                                <button
                                  onClick={() =>
                                    handleVerify(claim.id)
                                  }
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                  Verify
                                </button>
                              )}

                              {claim.status === "UNDER_REVIEW" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleDecision(
                                        claim.id,
                                        "APPROVED"
                                      )
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDecision(
                                        claim.id,
                                        "REJECTED"
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {(claim.status === "APPROVED" ||
                                claim.status === "REJECTED") && (
                                <span className="text-sm text-gray-500">
                                  Completed
                                </span>
                              )}

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

export default Claims;