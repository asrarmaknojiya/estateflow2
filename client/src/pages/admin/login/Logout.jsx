import { Navigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';

const LogoutPage = () => {
  const refresh = localStorage.getItem('refreshToken');
  if (refresh) {
    // fire and forget
    api.post('logout', { refreshToken: refresh }).catch(() => {});
  }
  localStorage.clear();
  return <Navigate to="/admin/login" replace />;
};

export default LogoutPage;
