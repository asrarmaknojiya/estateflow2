import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import api from "../../api/axiosInstance";

const ProtectedRoute = () => {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    api
      .get("me")
      .then((res) => {
        setMe(res.data); // user + roles
        setAuthorized(true);
        setChecking(false);
      })
      .catch(() => {
        setAuthorized(false);
        setChecking(false);
      });
  }, []);

  if (checking) return null;

  return authorized ? (
    <Outlet context={{ me }} />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default ProtectedRoute;
