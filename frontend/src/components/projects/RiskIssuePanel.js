import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const RiskIssuePanel = ({ projectId, isOwner }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "issue",
    title: "",
    description: "",
    impact_level: "medium",
  });

  useEffect(() => {
    fetchItems();
  }, [projectId]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        ` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${projectId}/risks-issues`,
        { headers }
      );
      setItems(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to load risks/issues.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (item, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        ` https://f0d5-49-146-202-126.ngrok-free.app/api/risks-issues/${item.id}`,
        { ...item, status: newStatus },
        { headers }
      );
      fetchItems();
      setActivePopover(null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        ` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${projectId}/risks-issues`,
        form,
        { headers }
      );
      setItems((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({ type: "issue", title: "", description: "", impact_level: "medium" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit.");
    }
  };

  const StatusPopover = ({ item }) => {
    const popoverRef = useRef(null);
    const nextStatus = item.status === "closed" ? "open" : "closed";

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
          setActivePopover(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div
        ref={popoverRef}
        className="position-absolute bg-light border rounded p-2 shadow"
        style={{ zIndex: 1000 }}
      >
        <button
          className="btn btn-sm text-white"
          style={{ backgroundColor: "#5c3d1c", border: "none" }}
          onClick={() => handleChangeStatus(item, nextStatus)}
        >
          Change to "{nextStatus}"
        </button>
      </div>
    );
  };

  const risks = items.filter((item) => item.type === "risk");
  const issues = items.filter((item) => item.type === "issue");

  if (loading) return <div className="p-3">Loading Risks/Issues...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card mt-4 shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📌 Project Risks & Issues</h5>
        {isOwner && (
          <button
            className="btn btn-sm text-white"
            style={{ backgroundColor: "#5c3d1c", border: "none" }}
            onClick={() => setShowModal(true)}
          >
            Report
          </button>
        )}
      </div>
      <div className="card-body">
        {/* Risks */}
        <h6 className="mb-3 fw-semibold">Risks</h6>
        {risks.length === 0 ? (
          <p className="text-muted">No risks reported.</p>
        ) : (
          <ul className="list-group mb-4">
            {risks.map((risk) => (
              <li
                key={risk.id}
                className="list-group-item position-relative d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div>
                  <strong>{risk.title}</strong>
                  <p className="mb-1 text-muted">{risk.description}</p>
                  <small className="text-muted"><strong>Impact:</strong> {risk.impact_level}</small>
                </div>
                <div className="text-end">
                  <span className={`badge bg-${risk.status === "open" ? "danger" : "success"} px-3 py-1`} style={{ borderRadius: "1rem" }}>
                    {risk.status}
                  </span>
                  {isOwner && (
                    <>
                      <button
                        className="btn btn-sm text-dark ms-2"
                        style={{ fontSize: "0.85rem", textDecoration: "underline" }}
                        onClick={() => setActivePopover(activePopover === risk.id ? null : risk.id)}
                      >
                        Change Status
                      </button>
                      {activePopover === risk.id && <StatusPopover item={risk} />}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Issues */}
        <h6 className="mb-3 fw-semibold">Issues</h6>
        {issues.length === 0 ? (
          <p className="text-muted">No issues reported.</p>
        ) : (
          <ul className="list-group">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className="list-group-item position-relative d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div>
                  <strong>{issue.title}</strong>
                  <p className="mb-1 text-muted">{issue.description}</p>
                  <small className="text-muted"><strong>Impact:</strong> {issue.impact_level}</small>
                </div>
                <div className="text-end">
                  <span className={`badge bg-${issue.status === "open" ? "danger" : "success"} px-3 py-1`} style={{ borderRadius: "1rem" }}>
                    {issue.status}
                  </span>
                  {isOwner && (
                    <>
                      <button
                        className="btn btn-sm text-dark ms-2"
                        style={{ fontSize: "0.85rem", textDecoration: "underline" }}
                        onClick={() => setActivePopover(activePopover === issue.id ? null : issue.id)}
                      >
                        Change Status
                      </button>
                      {activePopover === issue.id && <StatusPopover item={issue} />}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{ backgroundColor: "#fffaf3" }}>
              <div className="modal-header">
                <h5 className="modal-title">📝 Report Risk or Issue</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                  >
                    <option value="issue">Issue</option>
                    <option value="risk">Risk</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={form.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Impact Level</label>
                  <select
                    className="form-select"
                    name="impact_level"
                    value={form.impact_level}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn text-white"
                  style={{ backgroundColor: "#a47148", border: "none" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn text-white"
                  style={{ backgroundColor: "#5c3d1c", border: "none" }}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIssuePanel;
