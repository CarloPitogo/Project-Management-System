import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const ProjectMembers = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [creatorId, setCreatorId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const isOwner = currentUserId === creatorId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
       const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true"
      };


        const [membersRes, usersRes, projectRes] = await Promise.all([
          axios.get(`https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/members`, { headers }),
          axios.get("https://f0d5-49-146-202-126.ngrok-free.app/api/users", { headers }),
          axios.get(`https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}`, { headers }),
        ]);

        setMembers(membersRes.data.members);
        setAllUsers(usersRes.data.users);
        const project = projectRes.data.project;
        setProjectName(project.name);
        setCreatorId(project.user_id);

        const userRes = await axios.get("https://f0d5-49-146-202-126.ngrok-free.app/api/user", { headers });
        setCurrentUserId(userRes.data.id);
        setLoading(false);
      } catch {
        setError("Failed to load project members.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/members`,
        { user_id: selectedUser },
        { headers: { Authorization: `Bearer ${token}` ,"ngrok-skip-browser-warning": "true"} }
      );
      setSelectedUser("");
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await axios.get(`https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/members`, { headers });
      setMembers(res.data.members);
    } catch {
      alert("Failed to add user. Maybe already a member?");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/members/${userId}`,
        { headers: { Authorization: `Bearer ${token}` , "ngrok-skip-browser-warning": "true"} }
      );
      const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
      const res = await axios.get(`https://f0d5-49-146-202-126.ngrok-free.app/api/projects/${id}/members`, { headers });
      setMembers(res.data.members);
    } catch {
      alert("Failed to remove user.");
    }
  };

  const availableUsers = allUsers.filter(
    (user) => !members.some((member) => member.id === user.id)
  );

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#f7efe5" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
          <div className="mt-2">Loading Project Members...</div>
        </div>
      </div>
    );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ backgroundColor: "#f7efe5", minHeight: "100vh", padding: "2rem" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-dark">👥 Members of "{projectName}"</h3>
          <Link to={`/projects/${id}`} className="btn text-white" style={{ backgroundColor: "#a47148", border: "none" }}>
            ← Back to Project
          </Link>
        </div>

        {!isOwner && (
          <div className="alert alert-info">
            You can view the members, but only the project owner can add or remove them.
          </div>
        )}

        <div className="card shadow-sm mb-4" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header fw-semibold">➕ Add Member</div>
          <div className="card-body d-flex gap-2 flex-wrap">
            <select
              className="form-select w-100 w-md-75"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {isOwner && (
              <button
                onClick={handleAddMember}
                className="btn text-white"
                style={{ backgroundColor: "#5c3d1c", border: "none" }}
                disabled={!selectedUser}
              >
                Add
              </button>
            )}
          </div>
        </div>

        <div className="card shadow-sm" style={{ backgroundColor: "#fffaf3" }}>
          <div className="card-header fw-semibold">📋 Current Members</div>
          <ul className="list-group list-group-flush">
            {members.map((member) => (
              <li
                key={member.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {member.name} ({member.email})
                  {member.id === creatorId && (
                    <span className="badge bg-primary ms-2">Owner</span>
                  )}
                </span>
                <button
                  className="btn btn-sm text-white"
                  style={{ backgroundColor: "#a47148", border: "none" }}
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={!isOwner || member.id === creatorId}
                >
                  Remove
                </button>
              </li>
            ))}
            {members.length === 0 && (
              <li className="list-group-item">No members yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembers;
