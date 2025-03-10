import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="app-container">
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
