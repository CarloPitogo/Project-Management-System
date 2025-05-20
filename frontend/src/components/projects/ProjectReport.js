import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#d0ed57"];

const ProjectReport = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [projectRes, tasksRes, expendituresRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/tasks`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/expenditures`, { headers }),
        ]);

        setProject(projectRes.data.project);
        setTasks(tasksRes.data.tasks);
        setExpenditures(expendituresRes.data);
        setLoading(false);
      } catch {
        setError("Failed to load report data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const totalCost = expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const completion = tasks.length
    ? Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100)
    : 0;

  const chartData = expenditures.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.description);
    if (existing) {
      existing.value += Number(exp.amount);
    } else {
      acc.push({ name: exp.description, value: Number(exp.amount) });
    }
    return acc;
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", backgroundColor: "#f7efe5" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" />
          <div className="mt-2">Loading report...</div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">
        <div className="mb-4">
          <h2 className="fw-bold text-dark">📊 Project Report: {project.name}</h2>
          <p className="text-muted">{project.description}</p>
        </div>

        {/* Progress - full width */}
        <div className="card shadow-sm mb-4" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header fw-semibold">✅ Progress</div>
          <div className="card-body">
            <p><strong>Total Tasks:</strong> {tasks.length}</p>
            <p><strong>Completed:</strong> {tasks.filter(t => t.status === "completed").length}</p>
            <p><strong>Progress:</strong></p>
            <div className="progress">
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${completion}%` }}
                aria-valuenow={completion}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {completion}%
              </div>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="card shadow-sm mb-4" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header fw-semibold">💰 Budget</div>
          <div className="card-body">
            <p><strong>Budget:</strong> ₱{Number(project.budget || 0).toFixed(2)}</p>
            <p><strong>Actual Cost:</strong> ₱{totalCost.toFixed(2)}</p>
            <p><strong>Remaining Budget:</strong> ₱{(project.budget - totalCost).toFixed(2)}</p>
            <p>
              <strong>Status:</strong>{" "}
              {totalCost > project.budget ? (
                <span className="text-danger fw-semibold">Over Budget</span>
              ) : (
                <span className="text-success fw-semibold">Within Budget</span>
              )}
            </p>
          </div>
        </div>

        {/* Row: Breakdown + Table */}
        <div className="row">
          {/* Pie chart (right) */}
          <div className="col-md-6 order-md-2 mb-4">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#fffaf3" }}>
              <div className="card-header fw-semibold">📈 Expenditure Breakdown</div>
              <div className="card-body">
                {chartData.length === 0 ? (
                  <p className="text-muted">No expenditures to display.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Table (left) */}
          <div className="col-md-6 order-md-1 mb-4">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#fffaf3" }}>
              <div className="card-header fw-semibold">📋 Detailed Expenditures</div>
              <div className="card-body table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenditures.map((exp, i) => (
                      <tr key={exp.id}>
                        <td>{i + 1}</td>
                        <td>{exp.description}</td>
                        <td>₱{Number(exp.amount).toFixed(2)}</td>
                        <td>{new Date(exp.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-4 text-end">
          <Link to={`/projects/${id}`} className="btn btn-outline-dark">
            ← Back to Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectReport;
