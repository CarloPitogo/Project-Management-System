import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'react-feather';
import axios from 'axios';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(" https://f0d5-49-146-202-126.ngrok-free.app/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        if (data.length > notifications.length) setHasNew(true);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications.");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const toggleModal = () => {
    setShowModal(!showModal);
    setHasNew(false);
  };

  return (
    <>
      <div
        className="d-flex flex-column flex-shrink-0 p-3 text-white sidebar"
        style={{
          width: '250px',
          height: '100vh',
          position: 'fixed',
          backgroundColor: '#d2b48c',
          color: '#4a2e00',
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link
            to="/"
            className="text-decoration-none fw-bold fs-5"
            style={{ color: '#4a2e00' }}
          >
           Project Management System
          </Link>
          <button
            className="btn btn-sm position-relative"
            style={{
              border: '1px solid #5c3d1c',
              color: '#5c3d1c',
              backgroundColor: 'transparent',
            }}
            onClick={toggleModal}
          >
            <Bell size={18} />
            {hasNew && (
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            )}
          </button>
        </div>

        <hr className="border-dark" />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              style={{
                backgroundColor: location.pathname === '/' ? '#5c3d1c' : 'transparent',
                color: location.pathname === '/' ? '#fff' : '#4a2e00',
              }}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/projects"
              className={`nav-link ${location.pathname.includes('/projects') ? 'active' : ''}`}
              style={{
                backgroundColor: location.pathname.includes('/projects') ? '#5c3d1c' : 'transparent',
                color: location.pathname.includes('/projects') ? '#fff' : '#4a2e00',
              }}
            >
              Projects
            </Link>
          </li>
        </ul>
        <hr className="border-dark" />
        <div className="text-center small mb-2" style={{ color: "#000" }}>
          Welcome,<br />
          <strong>{user?.name}</strong>
        </div>
        <button
          onClick={onLogout}
          className="btn btn-sm btn-outline-dark"
        >
          Logout
        </button>
      </div>

      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          onClick={toggleModal}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recent Activity</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                ></button>
              </div>
              <div className="modal-body">
                {notifications.length === 0 ? (
                  <p>No recent activity.</p>
                ) : (
                  <ul className="list-group">
                    {notifications.map((activity) => (
                      <li key={activity.id} className="list-group-item">
                        <div>
                          <strong>
                            {activity.user?.name || 'Unknown'} – {activity.description}
                          </strong>
                          <br />
                          <small className="text-muted">
                            {new Date(activity.created_at).toLocaleString()}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
