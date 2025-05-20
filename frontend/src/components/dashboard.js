import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true", // <--- This bypasses the ngrok warning
      };


       const projectsResponse = await axios.get(
        "https://f0d5-49-146-202-126.ngrok-free.app/api/projects?limit=5",
        { headers }
      );

      const tasksResponse = await axios.get(
        "https://f0d5-49-146-202-126.ngrok-free.app/api/tasks?assigned_to_me=1&limit=5",
        { headers }
      );

        setTasks(tasksResponse.data.tasks);

        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch dashboard data");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", backgroundColor: "#f7efe5" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading dashboard...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="alert alert-danger"
        style={{ backgroundColor: "#f7efe5" }}
      >
        {error}
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">
        <div className="mb-4 text-center">
          <h2 className="fw-bold" style={{ color: "#4a2e00" }}>
            📊 Project Management Dashboard
          </h2>
          <p className="text-muted">Track your projects and tasks with ease.</p>
        </div>

        <div className="row g-4">
          {/* Menu */}
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
              <div className="card-body d-flex flex-wrap gap-3 justify-content-center">
                <Link to="/projects/create" className="btn btn-outline-dark">
                  + New Project
                </Link>
                <Link to="/projects" className="btn btn-outline-secondary">
                  📁 Manage Projects
                </Link>
                {/* Optional Future Buttons */}
                {/* <Link to="/tasks/create" className="btn btn-outline-success">+ New Task</Link> */}
                {/* <Link to="/tasks" className="btn btn-outline-secondary">🗂 Manage Tasks</Link> */}
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: "#fff8f0" }}>
              <div className="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark">📋 Recent Projects</h5>
                <Link to="/projects" className="btn btn-sm btn-outline-dark">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {projects.length === 0 ? (
                  <p className="text-muted">No recent projects.</p>
                ) : (
                  <div className="list-group">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/projects/${project.id}`}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1 fw-semibold">{project.name}</h6>
                          <small className="text-muted">
                            {project.description
                              ? `${project.description.substring(0, 50)}...`
                              : "No description"}
                          </small>
                        </div>
                        <span className={`badge rounded-pill bg-${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Tasks */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: "#fff8f0" }}>
              <div className="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark">✅ My Tasks</h5>
                <Link to="/tasks" className="btn btn-sm btn-outline-dark">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {tasks.length === 0 ? (
                  <p className="text-muted">No tasks assigned to you.</p>
                ) : (
                  <div className="list-group">
                    {tasks.map((task) => (
                      <Link
                        key={task.id}
                        to={`/tasks/${task.id}`}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1 fw-semibold">{task.title}</h6>
                          <small className="text-muted">
                            Project:{" "}
                            {task.project?.name || `Project #${task.project_id}`}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className={`badge rounded-pill bg-${getStatusBadge(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                          <br />
                          <small className="text-muted">
                            Due:{" "}
                            {task.due_time
                              ? new Date(task.due_time).toLocaleDateString()
                              : "Not set"}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "planning":
      return "secondary";
    case "active":
      return "primary";
    case "completed":
      return "success";
    case "on_hold":
      return "warning";
    case "todo":
      return "secondary";
    case "in_progress":
      return "primary";
    case "review":
      return "info";
    default:
      return "light";
  }
};

export default Dashboard;
