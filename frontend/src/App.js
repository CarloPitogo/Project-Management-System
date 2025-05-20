import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Layout and core components
import Nav from "./components/layout/Nav";
import Dashboard from "./components/dashboard";
import Login from "./components/login";
import Register from "./components/registration";

// Project components
import ProjectList from "./components/projects/ProjectList";
import ProjectForm from "./components/projects/ProjectForm";
import ProjectDetail from "./components/projects/ProjectDetail";
import ProjectMembers from "./components/projects/ProjectMembers";
import ProjectReport from "./components/projects/ProjectReport";

// Task components
import TaskList from "./components/tasks/TaskList";
import TaskForm from "./components/tasks/TaskForm";
import TaskDetail from "./components/tasks/TaskDetail";

// Expenditure components
import ExpenditureList from "./components/expenditure/ExpenditureList";
import AddExpenditure from "./components/expenditure/AddExpenditure";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.id) {
          setIsAuthenticated(true);
          setUser(res.data);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
      } catch {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);

    // Immediately fetch user info after login
    axios
      .get("http://localhost:8000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Nav user={user} onLogout={handleLogout} />}
        <div className="container py-4">
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Dashboard onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            {/* Projects */}
            <Route
              path="/projects"
              element={
                isAuthenticated ? <ProjectList /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/create"
              element={
                isAuthenticated ? <ProjectForm /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:id"
              element={
                isAuthenticated ? <ProjectDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                isAuthenticated ? <ProjectForm /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:id/members"
              element={
                isAuthenticated ? <ProjectMembers /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:id/report"
              element={
                isAuthenticated ? <ProjectReport /> : <Navigate to="/login" />
              }
            />

            {/* Tasks */}
            <Route
              path="/tasks"
              element={
                isAuthenticated ? <TaskList /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:projectId/tasks"
              element={
                isAuthenticated ? <TaskList /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/projects/:projectId/tasks/create"
              element={
                isAuthenticated ? <TaskForm /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/tasks/:taskId"
              element={
                isAuthenticated ? <TaskDetail /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/tasks/:taskId/edit"
              element={
                isAuthenticated ? <TaskForm /> : <Navigate to="/login" />
              }
            />

            {/* Expenditures */}
            <Route
              path="/projects/:id/expenditures"
              element={
                isAuthenticated ? (
                  <ExpenditureList />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/projects/:id/expenditures/add"
              element={
                isAuthenticated ? (
                  <AddExpenditure />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
