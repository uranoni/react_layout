import { Navigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        // 嘗試刷新 token
        await checkAuth();
      }
      setIsChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  if (isChecking) {
    // 可以顯示載入中的畫面
    return <div>載入中...</div>;
  }

  return isAuthenticated ? 
    element : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute; 