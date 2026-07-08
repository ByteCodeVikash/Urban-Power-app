import { useAuthStore } from '../store/authStore';

export const useHasPermission = () => {
  const role = useAuthStore(state => state.role);
  const permissions = useAuthStore(state => state.permissions) || [];

  const checkPermission = (permission?: string): boolean => {
    if (!permission) return true; // if no permission required, allow
    if (!role) return false;

    // Super Admin gets all permissions automatically
    const normalizedRole = role.toLowerCase().replace(/_/g, ' ').trim();
    if (normalizedRole === 'super admin') {
      return true;
    }

    return permissions.includes(permission);
  };

  return {
    checkPermission,
    userRole: role,
    hasRole: (checkRole: string) => role === checkRole,
  };
};
