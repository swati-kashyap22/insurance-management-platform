import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import Customers from "./Customers";
import CustomerHistory from "./CustomerHistory";
import Policies from "./Policies";
import Claims from "./Claims";
import Premiums from "./Premiums";
import Documents from "./Documents";
import Reports from "./Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/policies"
  element={<Policies />}
/>
<Route path="/reports" element={<Reports />} />
<Route
  path="/documents"
  element={<Documents />}
/>
<Route
  path="/premiums"
  element={<Premiums />}
/>
        <Route
  path="/claims"
  element={<Claims />}
/>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/customers/:id/history"
          element={<CustomerHistory />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;