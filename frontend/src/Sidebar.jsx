import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const adminAgentItems = [
    { name: "Customers", path: "/customers" },
    { name: "Policies", path: "/policies" },
    { name: "Reports", path: "/reports" },
    { name: "Claims", path: "/claims" },
    { name: "Premiums", path: "/premiums" },
    { name: "Documents", path: "/documents" },
  ];

  const customerItems = [
    { name: "Policies", path: "/policies" },
    { name: "Claims", path: "/claims" },
    { name: "Premiums", path: "/premiums" },
    { name: "Documents", path: "/documents" },
  ];

  const menuItems =
    role === "ADMIN" || role === "AGENT"
      ? adminAgentItems
      : customerItems;

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Insurance Platform</h1>
        <p className="text-gray-400 text-xs mt-1">
          {role || "User"}
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold">
            {user?.name || "User"}
          </p>

          <p className="text-xs text-gray-400">
            {user?.email || ""}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;