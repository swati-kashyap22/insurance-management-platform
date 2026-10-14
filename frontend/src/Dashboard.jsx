import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const storedUser = JSON.parse(
          localStorage.getItem("user")
        );

        setUser(storedUser);

        if (!storedUser) {
          throw new Error("User information not found");
        }

        // --------------------------------
        // ADMIN / AGENT DASHBOARD
        // --------------------------------

        if (
          storedUser.role === "ADMIN" ||
          storedUser.role === "AGENT"
        ) {
          const data = await apiRequest(
            "/reports/dashboard"
          );

          setReports(data.reports);
        }

        // --------------------------------
        // CUSTOMER DASHBOARD
        // --------------------------------

        if (storedUser.role === "CUSTOMER") {
          const data = await apiRequest(
            "/customers/profile"
          );

          setProfile(data.customer);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Unable to load dashboard
            </h2>

            <p className="text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------
  // CUSTOMER DASHBOARD
  // --------------------------------

  if (user?.role === "CUSTOMER") {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <Sidebar />

        <div className="flex-1">
          <header className="bg-white shadow-sm">
            <div className="px-8 py-5">
              <h1 className="text-2xl font-bold text-gray-800">
                Customer Dashboard
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user.name}
              </p>
            </div>
          </header>

          <main className="p-8">

            {/* WELCOME */}

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Welcome, {user.name} 👋
              </h2>

              <p className="text-gray-500 mt-2">
                Manage your insurance policies, claims,
                premiums and documents from your dashboard.
              </p>
            </div>

            {/* PROFILE */}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                My Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-gray-500">
                    Name
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {profile?.user?.name || user.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Email
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {profile?.user?.email || user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Phone
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Address
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {profile?.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Date of Birth
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {profile?.dateOfBirth
                      ? new Date(
                          profile.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Role
                  </p>

                  <p className="font-semibold text-blue-600 mt-1">
                    Customer
                  </p>
                </div>

              </div>
            </div>

          </main>
        </div>
      </div>
    );
  }

  // --------------------------------
  // ADMIN / AGENT DASHBOARD
  // --------------------------------

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-5">
            <h1 className="text-2xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Insurance management overview
            </p>
          </div>
        </header>

        <main className="p-8">

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Total Customers
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reports?.customers?.total || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Active Policies
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                {reports?.policies?.active || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Total Claims
              </p>

              <p className="text-3xl font-bold text-purple-600 mt-2">
                {reports?.claims?.total || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-500 text-sm">
                Premium Collection
              </p>

              <p className="text-3xl font-bold text-green-600 mt-2">
                ₹
                {Number(
                  reports?.premiums?.totalCollection || 0
                ).toLocaleString()}
              </p>
            </div>

          </div>

          {/* CLAIM STATUS */}

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Claim Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Pending
                </p>

                <p className="text-2xl font-bold text-yellow-600">
                  {reports?.claims?.pending || 0}
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Under Review
                </p>

                <p className="text-2xl font-bold text-orange-600">
                  {reports?.claims?.underReview || 0}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Approved
                </p>

                <p className="text-2xl font-bold text-green-600">
                  {reports?.claims?.approved || 0}
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">
                  Rejected
                </p>

                <p className="text-2xl font-bold text-red-600">
                  {reports?.claims?.rejected || 0}
                </p>
              </div>

            </div>
          </div>

          {/* PREMIUM STATUS */}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Premium Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div>
                <p className="text-gray-500">
                  Total Collection
                </p>

                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹
                  {Number(
                    reports?.premiums?.totalCollection || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Pending Payments
                </p>

                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {reports?.premiums?.pending || 0}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Overdue Payments
                </p>

                <p className="text-2xl font-bold text-red-600 mt-1">
                  {reports?.premiums?.overdue || 0}
                </p>
              </div>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;