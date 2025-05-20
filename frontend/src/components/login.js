import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("https://f0d5-49-146-202-126.ngrok-free.app/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true" // <-- bypass ngrok warning
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      onLogin(data.token);
      navigate("/");
    } else {
      setError(data.message || "Login failed");
    }
  } catch (error) {
    setError("Server error");
  }
};


  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f7efe5" }} // Light brown background
    >
      <div
        className="card shadow p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: "#d2b48c", // Soft brown card
          border: "none",
          color: "#4a2e00",
        }}
      >
        <h3 className="text-center mb-2 fw-bold">Welcome Back</h3>
        <p className="text-center mb-4" style={{ color: "#5c443a" }}>
          Log in to your account
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              style={{ backgroundColor: "#fffaf3" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              style={{ backgroundColor: "#fffaf3" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-flex justify-content-between mb-3 align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
            <button
              type="button"
              className="btn btn-link p-0 text-decoration-none"
              style={{ color: "#4a2e00" }}
              onClick={() => alert("Coming soon")}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="btn w-100 mb-3"
            style={{ backgroundColor: "#5c3d1c", color: "white" }}
          >
            Login
          </button>

          <div className="text-center mb-2" style={{ color: "#5c443a" }}>
            or
          </div>

          <button
            type="button"
            className="btn btn-outline-dark w-100"
            onClick={() => navigate("/register")}
          >
            Create New Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
