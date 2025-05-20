// [imports]
import React, { useState, useEffect } from "react";
import ProjectGanttChart from "./ProjectGanttChart";
import RiskIssuePanel from "./RiskIssuePanel";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actualCost, setActualCost] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [projectRes, tasksRes, expRes, userRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/projects/${id}`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/tasks`, { headers }),
          axios.get(`http://localhost:8000/api/projects/${id}/expenditures`, { headers }),
          axios.get(`http://localhost:8000/api/user`, { headers }),
        ]);

        const totalCost = expRes.data.reduce((sum, exp) => sum + Number(exp.amount), 0);
        setProject(projectRes.data.project);
        setTasks(tasksRes.data.tasks);
        setActualCost(totalCost);
        setIsOwner(projectRes.data.project.user_id === userRes.data.id);
        setLoading(false);
      } catch {
        setError("Failed to fetch project details");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteProject = async () => {
    if (!window.confirm("Delete this project and all tasks?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete project");
      setTimeout(() => navigate(-1), 3000);
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    review: tasks.filter((t) => t.status === "review").length,
  };

  const completionPercentage =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f7efe5" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
          <div className="mt-2">Loading Project Detail...</div>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">

        {/* Header with Back Button */}
        <div className="d-flex align-items-center mb-4">
          <Link to="/projects" className="btn btn-secondary me-3">← Back</Link>
          <h2 className="fw-bold mb-0">{project.name}</h2>
        </div>

        {/* Project Details - Full Width */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
              <div className="card-header">📌 Project Details</div>
              <div className="card-body">
                <p><strong>Description:</strong> {project.description || "No description provided"}</p>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Status:</strong>{" "}
                      <span className={`badge bg-${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                    </p>
                    <p><strong>Members:</strong>{" "}
                      <Link to={`/projects/${project.id}/members`} className="btn btn-sm btn-outline-primary ms-2">
                        Manage
                      </Link>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Start:</strong> {new Date(project.start_date).toLocaleDateString()}</p>
                    <p><strong>Due:</strong> {project.due_date ? new Date(project.due_date).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Budget - Max Width */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
              <div className="card-header">📈 Progress & Budget</div>
              <div className="card-body">
                <div className="progress mb-3">
                  <div className="progress-bar" role="progressbar" style={{ width: `${completionPercentage}%` }}>
                    {completionPercentage}%
                  </div>
                </div>
                <p><strong>Budget:</strong> ₱{Number(project.budget || 0).toFixed(2)}</p>
                <p><strong>Remaining:</strong> ₱{Number(project.budget - actualCost).toFixed(2)}</p>
                <p><strong>Spent:</strong> ₱{Number(actualCost).toFixed(2)}</p>
                <p><strong>Status:</strong>{" "}
                  {actualCost > project.budget
                    ? <span className="text-danger">Over Budget</span>
                    : <span className="text-success">Within Budget</span>
                  }
                </p>

                <div className="row text-center mb-3">
                  <div className="col"><strong>{taskStats.todo}</strong><br /><small>Todo</small></div>
                  <div className="col"><strong>{taskStats.inProgress}</strong><br /><small>In Progress</small></div>
                  <div className="col"><strong>{taskStats.review}</strong><br /><small>Review</small></div>
                  <div className="col"><strong>{taskStats.completed}</strong><br /><small>Done</small></div>
                </div>

                {isOwner && (
                  <div className="d-flex flex-column gap-2">
                    <Link to={`/projects/${id}/expenditures`} className="btn btn-primary w-100">View Expenditures</Link>
                    <Link to={`/projects/${id}/expenditures/add`} className="btn btn-success w-100">Record Expenditure</Link>
                    <Link to={`/projects/${project.id}/report`} className="btn btn-dark w-100">View Report</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="card shadow-sm mb-4" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header">📅 Gantt Chart</div>
          <div className="card-body">
            <ProjectGanttChart tasks={tasks} />
          </div>
        </div>

        {/* Tasks */}
        <div className="card shadow-sm mb-4" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📋 Tasks</h5>
            <Link to={`/projects/${id}/tasks`} className="btn btn-sm btn-primary">Manage Tasks</Link>
          </div>
          <div className="card-body">
            {tasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map((task) => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span className={`badge bg-${getStatusBadge(task.status)}`}>{task.status.replace("_", " ")}</span></td>
                        <td><span className={`badge bg-${getPriorityBadge(task.priority)}`}>{task.priority}</span></td>
                        <td>{task.assignedUser?.name || "Unassigned"}</td>
                        <td>{task.due_time ? new Date(task.due_time).toLocaleDateString() : "Not set"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Risks & Issues + Edit/Delete */}
        <div className="card shadow-sm mb-5" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header">🚨 Risks and Issues</div>
          <div className="card-body">
            <RiskIssuePanel projectId={id} isOwner={isOwner} />
            {isOwner && (
              <div className="d-flex gap-2 mt-4 justify-content-end">
                <Link to={`/projects/${id}/edit`} className="btn btn-warning">Edit Project</Link>
                <button onClick={handleDeleteProject} className="btn btn-danger">Delete Project</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "planning": return "secondary";
    case "active": return "primary";
    case "completed": return "success";
    case "on_hold": return "warning";
    case "todo": return "secondary";
    case "in_progress": return "primary";
    case "review": return "info";
    default: return "light";
  }
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "low": return "success";
    case "medium": return "info";
    case "high": return "warning";
    case "urgent": return "danger";
    default: return "secondary";
  }
};

export default ProjectDetail;
