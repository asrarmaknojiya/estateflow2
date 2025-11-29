// src/pages/admin/login/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axiosInstance";

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

      nav("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>
      <form onSubmit={submitLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
