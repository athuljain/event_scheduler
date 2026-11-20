import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {

  return (
    <BrowserRouter>

      <AuthProvider>

        <Navbar />

        <Routes>

          {/* Public route */}
          <Route path="/" element={<Home />} />

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Protected admin routes */}
          <Route element={<ProtectedRoute />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

          </Route>

        </Routes>

      </AuthProvider>

    </BrowserRouter>
  );
}

export default App;