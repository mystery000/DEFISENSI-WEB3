import { Navigate } from 'react-router-dom';

import { Login } from '../pages/Login';
import { useAppContext } from '../context/app';

export const EntryRoute = () => {
  const { user } = useAppContext();

  return user.address ? (
    <Navigate to={`/portfolio/wallet/${user.address}`} />
  ) : (
    <Login />
  );
};
