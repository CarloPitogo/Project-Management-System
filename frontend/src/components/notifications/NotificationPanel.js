import React, { useEffect, useState } from "react";
import axios from "axios";

const NotificationPanel = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(" https://f0d5-49-146-202-126.ngrok-free.app/api/notifications", {
          headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
        });

        const newData = response.data;
        setActivities((prev) => {
          const newIds = newData
            .filter((item) => !prev.some((existing) => existing.id === item.id))
            .map((item) => item.id);

          setHighlightedIds(newIds);
          return newData;
        });
      } catch (err) {
        setError("Failed to load notifications.");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-4" style={{ backgroundColor: "#f7efe5", minHeight: "100vh" }}>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0 fw-bold">🔔 Recent Activity</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {activities.length === 0 ? (
            <p className="text-muted">No recent activity.</p>
          ) : (
            <ul className="list-group">
              {activities.map((activity) => (
                <li
                  key={activity.id}
                  className={`list-group-item border-0 rounded mb-2 shadow-sm ${
                    highlightedIds.includes(activity.id)
                      ? "bg-success bg-opacity-10 border-start border-success border-3"
                      : "bg-white"
                  }`}
                >
                  <div>
                    <strong>{activity.user?.name || "Unknown"} – {activity.description}</strong>
                    <br />
                    <small className="text-muted">{new Date(activity.created_at).toLocaleString()}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
