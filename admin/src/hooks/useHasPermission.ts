import type { Permission } from '../config/roles';
import { useAuthStore } from '../store/authStore';

export const useHasPermission = () => {
  const user = useAuthStore(state => state.user);
  const permissions = useAuthStore(state => state.permissions) || [];

  const checkPermission = (permission?: Permission): boolean => {
    if (!permission) return true; // if no permission required, allow
    if (!user || !user.role) return false;
    
    // Super Admin gets all permissions
    const normalizedRole = user.role.toLowerCase().trim();
    if (normalizedRole === 'super admin' || normalizedRole === 'super_admin') {
      return true;
    }
    
    return permissions.includes(permission);
  };

  return {
    checkPermission,
    userRole: user?.role || null,
    hasRole: (role: string) => user?.role === role,
  };
};

