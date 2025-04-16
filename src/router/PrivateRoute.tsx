import { Navigate, useLocation } from 'react-router';
import useAuthStore from '../store/useAuthStore';
import { useEffect, useState } from 'react';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { isAuthenticated, refreshAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // 嘗試刷新 token
        await refreshAuth();
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, refreshAuth]);

  if (isChecking) {
    // 可以顯示載入中的畫面
    return <div>載入中...</div>;
  }

  return isAuthenticated ? 
    element : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute; 