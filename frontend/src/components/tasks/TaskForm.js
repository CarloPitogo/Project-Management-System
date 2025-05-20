import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const TaskForm = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!taskId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: projectId || "",
    assigned_to: "",
    status: "todo",
    priority: "medium",
    start_time: "",
    due_time: "",
  });

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        let resolvedProjectId = projectId;

        if (isEditing) {
          const taskResponse = await axios.get(
            `http://localhost:8000/api/tasks/${taskId}`,
            { headers }
          );
          const task = taskResponse.data.task;

          setFormData({
            title: task.title,
            description: task.description || "",
            project_id: task.project_id,
            assigned_to: task.assigned_to || "",
            status: task.status,
            priority: task.priority,
            start_time: task.start_time ? task.start_time.slice(0, 16) : "",
            due_time: task.due_time ? task.due_time.slice(0, 16) : "",
          });

          resolvedProjectId = task.project_id;
        }

        if (resolvedProjectId) {
          const membersResponse = await axios.get(
            `http://localhost:8000/api/projects/${resolvedProjectId}/members`,
            { headers }
          );
          setUsers(membersResponse.data.members);
        }

        const projectsResponse = await axios.get(
          "http://localhost:8000/api/projects",
          { headers }
        );
        setProjects(projectsResponse.data.projects);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load form data");
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, projectId, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const method = isEditing ? "put" : "post";
      const url = isEditing
        ? `http://localhost:8000/api/tasks/${taskId}`
        : "http://localhost:8000/api/tasks";

      await axios({
        method,
        url,
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate(`/projects/${formData.project_id}/tasks`);
    } catch (err) {
      setError("Failed to save task");
    }
  };

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
          />
          <div className="mt-2">Loading Form...</div>
        </div>
      </div>
    );

  return (
    <div className="container py-5" style={{ backgroundColor: "#f7efe5", minHeight: "100vh" }}>
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "700px" }}>
        <div className="card-header bg-white">
          <h3 className="mb-0">{isEditing ? "Edit Task" : "Create New Task"}</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Task Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="project_id" className="form-label">Project</label>
              <select
                className="form-select"
                id="project_id"
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                required
                disabled={!!projectId}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="row mb-3">
              <div className="col">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={formData.status === "completed"}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="col">
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  className="form-select"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col">
                <label htmlFor="assigned_to" className="form-label">Assign To</label>
                <select
                  className="form-select"
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col">
                <label htmlFor="start_time" className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="due_time" className="form-label">Due Time</label>
              <input
                type="datetime-local"
                className="form-control"
                id="due_time"
                name="due_time"
                value={formData.due_time}
                onChange={handleChange}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-success">
                {isEditing ? "Update Task" : "Create Task"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/projects/${formData.project_id}/tasks`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
