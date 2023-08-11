import { ReactNode } from 'react';
import { useAppContext } from '../context/app';
import { useNavigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAppContext();
  const naviate = useNavigate();

  if (!user.address) {
    naviate('/login');
  }

  return <>{children}</>;
};
