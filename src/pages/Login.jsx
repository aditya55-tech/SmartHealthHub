import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authApi";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const data = await login(
        form.email,
        form.password
      );

      console.log("LOGIN SUCCESS:", data);

      navigate("/");
    } catch (error) {
      console.log("FULL LOGIN ERROR:", error);

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper auth-wrapper">
      <div className="auth-container">

        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            🏥 SmartHealthHub
          </Link>

          <h1>Welcome back</h1>

          <p>
            Sign in to access your account and order history
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            ❌ {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>

            <input
              className="form-input"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>

            <input
              className="form-input"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <label>
              <input type="checkbox" />
              {" "}Remember me
            </label>

            <span
              style={{
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            className={
              "btn btn-primary btn-lg btn-block" +
              (loading ? " loading" : "")
            }
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login →"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{" "}
          <Link to="/register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}