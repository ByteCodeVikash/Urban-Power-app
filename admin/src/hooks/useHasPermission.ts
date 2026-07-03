import { useAuthStore } from '../store/authStore';
import { hasPermission, Permission } from '../config/roles';

export const useHasPermission = () => {
  const user = useAuthStore((state) => state.user);

  const checkPermission = (permission?: Permission): boolean => {
    if (!permission) return true; // if no permission required, allow
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  };

  return {
    checkPermission,
    userRole: user?.role || null,
    hasRole: (role: string) => user?.role === role,
  };
};
