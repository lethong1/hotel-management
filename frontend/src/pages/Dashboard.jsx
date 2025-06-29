import React from "react";
import Sidebar from "../components/Nav/Sidebar";
import Panel from "../components/Nav/Panel";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <Sidebar />
      <Panel />
      <div className="main-content" style={{ marginLeft: "18%" }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
