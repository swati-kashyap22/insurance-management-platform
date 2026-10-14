import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const query = searchValue
        ? `?search=${encodeURIComponent(searchValue)}`
        : "";

      const data = await apiRequest(`/customers${query}`);

      setCustomers(data.customers);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    loadCustomers(search);
  };

  const handleClear = () => {
    setSearch("");
    loadCustomers("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN AREA */}
      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-5">
            <h1 className="text-2xl font-bold text-gray-800">
              Customers
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Manage registered customers
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-8">

          {/* SEARCH */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg"
              >
                Clear
              </button>
            </form>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* CUSTOMER TABLE */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">
                Customer List
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {customers.length} customer(s) found
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading customers...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No customers found.
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        ID
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Name
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Email
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Phone
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Address
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Role
                      </th>

                      <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y">

                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50"
                      >

                        {/* ID */}
                        <td className="px-6 py-4 text-gray-700">
                          {customer.id}
                        </td>

                        {/* NAME */}
                        <td className="px-6 py-4 font-semibold text-gray-800">
                          {customer.user?.name || "-"}
                        </td>

                        {/* EMAIL */}
                        <td className="px-6 py-4 text-gray-600">
                          {customer.user?.email || "-"}
                        </td>

                        {/* PHONE */}
                        <td className="px-6 py-4 text-gray-600">
                          {customer.phone || "-"}
                        </td>

                        {/* ADDRESS */}
                        <td className="px-6 py-4 text-gray-600">
                          {customer.address || "-"}
                        </td>

                        {/* ROLE */}
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                            {customer.user?.role || "CUSTOMER"}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              navigate(
                                `/customers/${customer.id}/history`
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            View History
                          </button>

                        </td>

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

export default Customers;