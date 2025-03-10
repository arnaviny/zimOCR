import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import ZimLogo from "../../assets/logosvg.svg";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement actual logout logic
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <img src={ZimLogo} alt="ZimLogo"  />
        </div>
        <h1>CargoView</h1>
      </div>
      <div className="header-right">
        <span>Hello, User</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}

export default Header;
