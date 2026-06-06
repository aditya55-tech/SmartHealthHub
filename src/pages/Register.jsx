import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authApi";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await register(
        form.name,
        form.email,
        form.password
      );

      console.log("REGISTER SUCCESS:", data);

      navigate("/");
    } catch (error) {
      console.log("FULL REGISTER ERROR:", error);

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed"
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

          <h1>Create Account</h1>

          <p>
            Join thousands of customers who trust SmartHealthHub
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
              Full Name
            </label>

            <input
              className="form-input"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />
          </div>

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
              placeholder="Create password"
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

          <div className="form-group">
            <label className="form-label">
              Confirm Password
            </label>

            <input
              className="form-input"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({
                  ...form,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
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
              ? "Creating Account..."
              : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}