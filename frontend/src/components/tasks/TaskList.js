import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const TaskList = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' };

        const userResponse = await axios.get(" https://f0d5-49-146-202-126.ngrok-free.app/api/user", { headers });
        setUser(userResponse.data);

        let tasksResponse;

        if (projectId) {
          tasksResponse = await axios.get(` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${projectId}/tasks`, { headers });
          const projectResponse = await axios.get(` https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${projectId}`, { headers });
          setProject(projectResponse.data.project);
        } else {
          tasksResponse = await axios.get(` https://f0d5-49-146-202-126.ngrok-free.app/api/tasks?assigned_to_me=1`, { headers });
        }

        setTasks(tasksResponse.data.tasks);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(` https://f0d5-49-146-202-126.ngrok-free.app/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f7efe5" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
          <div className="mt-2">Fetching Tasks...</div>
        </div>
      </div>
    );
  }

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-5" style={{ backgroundColor: "#f7efe5", minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">{projectId ? `Tasks for "${project?.name}"` : "My Tasks"}</h2>
        <div>
          {projectId && (
            <Link to={`/projects/${projectId}`} className="btn btn-outline-secondary me-2">
              Back to Project
            </Link>
          )}
          {(user && (!projectId || (project && user.id === project.owner_id))) && (
            <Link
              to={projectId ? `/projects/${projectId}/tasks/create` : "/tasks/create"}
              className="btn btn-success"
            >
              + Add Task
            </Link>
          )}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted">
          {projectId ? "No tasks found for this project." : "No tasks found."}
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover shadow-sm rounded bg-white">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <span className={`badge bg-${getStatusBadge(task.status)}`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge bg-${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.due_time
                      ? new Date(task.due_time).toLocaleDateString()
                      : "Not set"}
                  </td>
                  <td>{task.assignedUser?.name || "Unassigned"}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-info">
                        View
                      </Link>
                      {user && project && user.id === project.owner_id && (
                        <>
                          <Link to={`/tasks/${task.id}/edit`} className="btn btn-sm btn-outline-warning">
                            Edit
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "todo": return "secondary";
    case "in_progress": return "primary";
    case "review": return "info";
    case "completed": return "success";
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

export default TaskList;
