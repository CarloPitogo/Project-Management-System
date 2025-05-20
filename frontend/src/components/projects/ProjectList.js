import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh', backgroundColor: '#f7efe5' }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-2">Fetching Projects...</div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ backgroundColor: '#f7efe5', minHeight: '100vh', padding: '2rem' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-dark mb-0">📁 Projects</h2>
          <Link to="/projects/create" className="btn btn-success">
            + Create New Project
          </Link>
        </div>

        <div className="row">
          {projects.length === 0 ? (
            <div className="text-muted">No projects found. Start by creating one.</div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="col-md-4 mb-4">
                <div className="card shadow-sm" style={{ backgroundColor: '#fffaf3' }}>
                  <div className="card-body">
                    <h5 className="card-title fw-semibold">{project.name}</h5>
                    <p className="card-text text-muted">
                      {project.description || 'No description'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className={`badge bg-${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                      <small className="text-muted">
                        Due: {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to={`/projects/${project.id}`} className="btn btn-dark btn-sm w-50">
                        View
                      </Link>
                      <Link to={`/projects/${project.id}/edit`} className="btn btn-warning btn-sm w-50">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'planning': return 'secondary';
    case 'active': return 'primary';
    case 'completed': return 'success';
    case 'on_hold': return 'warning';
    default: return 'info';
  }
};

export default ProjectList;
