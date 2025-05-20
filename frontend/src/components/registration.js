import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f7efe5" }}
    >
      <div
        className="card p-4 shadow-lg border-0"
        style={{
          maxWidth: "450px",
          width: "100%",
          backgroundColor: "#d2b48c",
          borderRadius: "1rem",
          color: "#4a2e00",
        }}
      >
        <h3 className="text-center mb-2 fw-bold">Create Account</h3>
        <p className="text-center mb-3" style={{ color: "#5c443a" }}>
          Join our project management platform
        </p>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              style={{ backgroundColor: "#fffaf3" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              style={{ backgroundColor: "#fffaf3" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              style={{ backgroundColor: "#fffaf3" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Confirm Password"
              style={{ backgroundColor: "#fffaf3" }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 d-none">
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
              <option value="client">Client</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn w-100 mb-3"
            style={{ backgroundColor: "#5c3d1c", color: "white" }}
          >
            Create Account
          </button>

          <div className="text-center">
            <small className="text-muted">or</small>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-outline-dark w-100 mt-2"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
