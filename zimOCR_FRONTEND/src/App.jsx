import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import PortsMap from "./pages/PortsMap";
import BillDetails from "./pages/BillDetails";
import "./styles/index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/documents"
          element={
            <Layout>
              <Documents />
            </Layout>
          }
        />
        <Route
          path="/bill-details/:id"
          element={
            <Layout>
              <BillDetails />
            </Layout>
          }
        />
        <Route
          path="/user-management"
          element={
            <Layout>
              <UserManagement />
            </Layout>
          }
        />
        <Route
          path="/ports-map"
          element={
            <Layout>
              <PortsMap />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
