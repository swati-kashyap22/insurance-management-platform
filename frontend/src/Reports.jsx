import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/reports/dashboard");

      setReports(data.reports);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">
            No report data available.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // CLAIM CHART DATA
  // -----------------------------

  const claimChartData = {
    labels: [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected",
    ],

    datasets: [
      {
        label: "Claims",
        data: [
          reports.claims.pending,
          reports.claims.underReview,
          reports.claims.approved,
          reports.claims.rejected,
        ],
      },
    ],
  };

  // -----------------------------
  // POLICY CHART DATA
  // -----------------------------

  const policyChartData = {
    labels: [
      "Active Policies",
      "Expired Policies",
    ],

    datasets: [
      {
        label: "Policies",
        data: [
          reports.policies.active,
          reports.policies.expired,
        ],
      },
    ],
  };

  // -----------------------------
  // CUSTOMER GROWTH DATA
  // -----------------------------

  const customerGrowthEntries = Object.entries(
    reports.customers.growth || {}
  );

  const customerGrowthData = {
    labels: customerGrowthEntries.map(
      ([month]) => month
    ),

    datasets: [
      {
        label: "New Customers",
        data: customerGrowthEntries.map(
          ([, count]) => count
        ),
        tension: 0.3,
      },
    ],
  };

  // -----------------------------
  // MONTHLY PREMIUM DATA
  // -----------------------------

  const premiumEntries = Object.entries(
    reports.premiums.monthlyCollection || {}
  );

  const premiumCollectionData = {
    labels: premiumEntries.map(
      ([month]) => month
    ),

    datasets: [
      {
        label: "Premium Collection",
        data: premiumEntries.map(
          ([, amount]) => Number(amount)
        ),
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1">
        {/* HEADER */}

        <header className="bg-white shadow-sm">
          <div className="px-8 py-5">
            <h1 className="text-2xl font-bold text-gray-800">
              Reports & Analytics
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Insurance business reports and analytics
            </p>
          </div>
        </header>

        <main className="p-8">

          {/* ERROR */}

          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* CUSTOMER & POLICY */}

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Customer & Policy Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Total Customers
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reports.customers.total}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Active Policies
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {reports.policies.active}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Expired Policies
              </p>

              <p className="text-3xl font-bold text-red-600 mt-2">
                {reports.policies.expired}
              </p>
            </div>

          </div>

          {/* CLAIMS */}

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Claim Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Total Claims
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reports.claims.total}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Pending
              </p>

              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {reports.claims.pending}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Under Review
              </p>

              <p className="text-3xl font-bold text-orange-600 mt-2">
                {reports.claims.underReview}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Approved
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {reports.claims.approved}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Rejected
              </p>

              <p className="text-3xl font-bold text-red-600 mt-2">
                {reports.claims.rejected}
              </p>
            </div>

          </div>

          {/* PREMIUMS */}

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Premium Reports
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Total Premium Collection
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹
                {Number(
                  reports.premiums.totalCollection
                ).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Pending Payments
              </p>

              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {reports.premiums.pending}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Overdue Payments
              </p>

              <p className="text-3xl font-bold text-red-600 mt-2">
                {reports.premiums.overdue}
              </p>
            </div>

          </div>

          {/* CHARTS */}

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Analytics
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* CLAIM CHART */}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Claim Statistics
              </h3>

              <div className="h-80">
                <Bar
                  data={claimChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* POLICY CHART */}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Policy Statistics
              </h3>

              <div className="h-80">
                <Bar
                  data={policyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* CUSTOMER GROWTH */}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Customer Growth
              </h3>

              {customerGrowthEntries.length === 0 ? (
                <p className="text-gray-500">
                  No customer growth data available.
                </p>
              ) : (
                <div className="h-80">
                  <Line
                    data={customerGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}
            </div>

            {/* PREMIUM COLLECTION */}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5">
                Monthly Premium Collection
              </h3>

              {premiumEntries.length === 0 ? (
                <p className="text-gray-500">
                  No premium collection data available.
                </p>
              ) : (
                <div className="h-80">
                  <Line
                    data={premiumCollectionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* CUSTOMER GROWTH TABLE */}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Customer Growth Details
            </h2>

            {customerGrowthEntries.length === 0 ? (
              <p className="text-gray-500">
                No customer growth data available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Month
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        New Customers
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {customerGrowthEntries.map(
                      ([month, count]) => (
                        <tr key={month}>
                          <td className="px-5 py-4">
                            {month}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>
              </div>
            )}
          </div>

          {/* PREMIUM COLLECTION TABLE */}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Monthly Premium Collection Details
            </h2>

            {premiumEntries.length === 0 ? (
              <p className="text-gray-500">
                No monthly collection data available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Month
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Premium Collection
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {premiumEntries.map(
                      ([month, amount]) => (
                        <tr key={month}>
                          <td className="px-5 py-4">
                            {month}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            ₹
                            {Number(
                              amount
                            ).toLocaleString()}
                          </td>
                        </tr>
                      )
                    )}
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

export default Reports;