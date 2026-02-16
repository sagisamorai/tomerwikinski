import React from 'react';
import { useUser } from '@clerk/clerk-react';

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children, fallback = null }) => {
  const { user } = useUser();
  const userRole = (user?.publicMetadata as any)?.role || 'editor';
  if (!roles.includes(userRole)) return <>{fallback}</>;
  return <>{children}</>;
};

export default RoleGuard;
