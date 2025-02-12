import { Navigate } from 'react-router';
import useAuthStore from '../store/useAuthStore';

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute = ({ element }: PrivateRouteProps) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute; 