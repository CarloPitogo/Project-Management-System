import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";

const AddExpenditure = () => {
  const { id } = useParams(); // project ID
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        ` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/expenditures`,
        {
          amount,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        }
      );
      navigate(`/projects/${id}/expenditures`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add expenditure. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">
        <h3 className="fw-bold text-dark mb-4">🧾 Record New Expenditure</h3>

        <div className="mb-4">
          <Link
            to={`/projects/${id}/expenditures`}
            className="btn text-white"
            style={{ backgroundColor: "#a47148", border: "none" }}
          >
            ← Back to Expenditures
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="card shadow-sm p-4" style={{ backgroundColor: "#fffaf3", maxWidth: "600px", margin: "0 auto" }}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label fw-semibold">
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={submitting}
            ></textarea>
          </div>

          <div className="mb-3">
            <label htmlFor="amount" className="form-label fw-semibold">
              Amount (₱)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn text-white w-100"
            style={{ backgroundColor: "#5c3d1c", border: "none" }}
            disabled={submitting}
          >
            {submitting ? "Recording..." : "Record Expenditure"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpenditure;
