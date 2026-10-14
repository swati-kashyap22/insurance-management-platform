import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function CustomerHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiRequest(`/customers/${id}/history`);

        setHistory(data.history);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-600">
          Loading customer history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Unable to load customer history
          </h2>

          <p className="text-gray-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/customers")}
            className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Customer History
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Complete customer information and activity
              </p>
            </div>

            <button
              onClick={() => navigate("/customers")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-semibold"
            >
              Back
            </button>

          </div>
        </header>

        {/* CONTENT */}
        <main className="p-8">

          {/* CUSTOMER PROFILE */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Customer Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <p className="text-sm text-gray-500">
                  Name
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.user?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Email
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.user?.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Phone
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Address
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.address || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Date of Birth
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.dateOfBirth
                    ? new Date(history.dateOfBirth).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Customer ID
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {history.id}
                </p>
              </div>

            </div>

          </div>

          {/* POLICIES */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Policies
            </h2>

            {history.policies?.length === 0 ? (
              <p className="text-gray-500">
                No policies found.
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3">
                        Policy Number
                      </th>

                      <th className="text-left px-4 py-3">
                        Type
                      </th>

                      <th className="text-left px-4 py-3">
                        Premium
                      </th>

                      <th className="text-left px-4 py-3">
                        Status
                      </th>

                      <th className="text-left px-4 py-3">
                        Start Date
                      </th>

                      <th className="text-left px-4 py-3">
                        End Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">

                    {history.policies?.map((policy) => (
                      <tr key={policy.id}>

                        <td className="px-4 py-4 font-semibold">
                          {policy.policyNumber}
                        </td>

                        <td className="px-4 py-4">
                          {policy.policyType}
                        </td>

                        <td className="px-4 py-4">
                          ₹{Number(policy.premiumAmount).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                            {policy.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {new Date(policy.startDate).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4">
                          {new Date(policy.endDate).toLocaleDateString()}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* CLAIMS */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Claims
            </h2>

            {history.claims?.length === 0 ? (
              <p className="text-gray-500">
                No claims found.
              </p>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-3">
                        Claim Number
                      </th>

                      <th className="text-left px-4 py-3">
                        Description
                      </th>

                      <th className="text-left px-4 py-3">
                        Amount
                      </th>

                      <th className="text-left px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">

                    {history.claims?.map((claim) => (
                      <tr key={claim.id}>

                        <td className="px-4 py-4 font-semibold">
                          {claim.claimNumber}
                        </td>

                        <td className="px-4 py-4">
                          {claim.description}
                        </td>

                        <td className="px-4 py-4">
                          ₹{Number(claim.amount).toLocaleString()}
                        </td>

                        <td className="px-4 py-4">
                          {claim.status}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* DOCUMENTS */}
          <div className="bg-white rounded-xl shadow-sm p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Documents
            </h2>

            {history.documents?.length === 0 ? (
              <p className="text-gray-500">
                No documents found.
              </p>
            ) : (
              <div className="space-y-3">

                {history.documents?.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between border rounded-lg p-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {document.fileName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {document.fileType}
                      </p>
                    </div>

                    <span className="text-sm text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}

              </div>
            )}

          </div>

        </main>

      </div>
    </div>
  );
}

export default CustomerHistory;