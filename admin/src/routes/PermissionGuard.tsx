import React from 'react';
import { useHasPermission } from '../hooks/useHasPermission';
import type { Permission } from '../config/roles';
import NoPermission from '../components/common/NoPermission';

interface PermissionGuardProps {
  requiredPermission?: Permission;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  children,
}) => {
  const { checkPermission } = useHasPermission();

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <NoPermission requiredPermission={requiredPermission} />;
  }

  return <>{children}</>;
};

export default PermissionGuard;
