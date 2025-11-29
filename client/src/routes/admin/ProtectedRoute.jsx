// src/routes/admin/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axiosInstance";

const ProtectedRoute = () => {
  const access = localStorage.getItem("accessToken");

  if (!access) return <Navigate to="/admin/login" replace />;

  const [checking, setChecking] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get("/me"); // ⭐ FIXED
        setMe(res.data);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/admin/login";
      }
      setChecking(false);
    };
    verify();
  }, []);

  if (checking) return <div></div>;

  return <Outlet context={{ me }} />;
};

export default ProtectedRoute;
