import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import ZimLogoBlue from "../assets/ZIM_Logo_Blue.png";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Implement actual authentication here
    console.log("Login with:", credentials);

    // For demo purposes, just navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={ZimLogoBlue} alt="ZIM Logo" />
        <h2>Sign In to myZIM</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
