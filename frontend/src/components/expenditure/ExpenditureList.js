import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ExpenditureList = () => {
  const { id } = useParams();
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingOwner, setCheckingOwner] = useState(true);

  const fetchExpenditures = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const projectRes = await axios.get(` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}`, { headers });
      const userRes = await axios.get(" https://f0d5-49-146-202-126.ngrok-free.app/api/user", { headers });

      const userId = userRes.data.id;
      const isOwnerMatch = projectRes.data.project.user_id === userId;

      if (!isOwnerMatch) {
        setError("You are not authorized to view this page.");
        setCheckingOwner(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/expenditures`, { headers });
      setExpenditures(response.data);
      setLoading(false);
      setCheckingOwner(false);
    } catch {
      setError("Failed to load expenditures or verify ownership.");
      setLoading(false);
      setCheckingOwner(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpenditures();
  }, [fetchExpenditures]);

  const handleDelete = async (expenditureId) => {
    if (!window.confirm("Are you sure you want to delete this expenditure?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(` https://f0d5-49-146-202-126.ngrok-free.app/api/expenditures/${expenditureId}`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      setExpenditures((prev) => prev.filter((exp) => exp.id !== expenditureId));
    } catch {
      alert("Failed to delete expenditure.");
    }
  };

  if (checkingOwner || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f7efe5" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" />
          <div className="mt-2">Checking access...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-dark">📄 Expenditure Records</h3>
          <div className="d-flex gap-2">
            <Link
              to={`/projects/${id}`}
              className="btn text-white"
              style={{ backgroundColor: "#a47148", border: "none" }}
            >
              ← Back to Project
            </Link>
            <Link
              to={`/projects/${id}/expenditures/add`}
              className="btn text-white"
              style={{ backgroundColor: "#5c3d1c", border: "none" }}
            >
              ➕ Record New
            </Link>
          </div>
        </div>

        {expenditures.length === 0 ? (
          <div className="alert alert-warning">No expenditures recorded for this project.</div>
        ) : (
          <div className="card shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
            <div className="card-body table-responsive">
              <table className="table table-striped table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Amount (₱)</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th style={{ width: "100px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenditures.map((exp, index) => (
                    <tr key={exp.id}>
                      <td>{index + 1}</td>
                      <td>{Number(exp.amount).toFixed(2)}</td>
                      <td>{exp.description}</td>
                      <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#a47148", border: "none" }}
                          onClick={() => handleDelete(exp.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenditureList;
