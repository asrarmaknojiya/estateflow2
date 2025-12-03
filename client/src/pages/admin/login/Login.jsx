// src/pages/admin/login/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";
import "../../../assets/css/admin/login.css";

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", { email, password });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      nav("/admin/manage-clients");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container">
      <div className="login-container">
        <div className="login-section">
          <div className="login-heading ">
            <h5>Login</h5>
          </div>
          <div className="Login-form">
            <form onSubmit={submitLogin}>
              <div className="login-input">
                <input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="login-input">
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="login-button">
                <button type="submit" className="primary-btn">Login</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
