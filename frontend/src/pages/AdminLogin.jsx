import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(email, password);

      navigate("/admin/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >

        <h2>Admin Login</h2>

        <p>Sign in to manage your events</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

        </div>

        <div className="form-group">

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

        </div>

        <button
          type="submit"
          disabled={loading}
          className="login-btn"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link to="/" className="back-link">
          Back to events
        </Link>

      </form>

    </div>
  );
};

export default AdminLogin;