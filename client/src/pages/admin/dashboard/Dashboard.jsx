import React from "react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { useOutletContext } from "react-router-dom";

const Dashboard = () => {
  const { me } = useOutletContext();
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="admin-panel-header-div">
        <div>
          <h1>Dashboard</h1>
          <p>Hello {me.user.name}</p>
          <p>Your roles: {me.roles.join(", ")}</p>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
