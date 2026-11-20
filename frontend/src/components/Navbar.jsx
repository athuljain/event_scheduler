import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { admin, isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          Event<span>Scheduler</span>
        </Link>

        <div className="nav-links">

          <Link to="/">Events</Link>

          {isAuthenticated ? (
            <>
              <Link to="/admin/dashboard">
                Dashboard
              </Link>

              <span className="admin-name">
                {admin?.email}
              </span>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="login-link">
              Admin Login
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;