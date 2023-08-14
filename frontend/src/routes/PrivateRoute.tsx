import { useAppContext } from '../context/app';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {
  const { user } = useAppContext();

  return user.address ? <Outlet /> : <Navigate to="/login" />;
};
