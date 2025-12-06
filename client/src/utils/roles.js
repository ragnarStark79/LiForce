// Role-based utility functions
export const ROLES = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

// Check if user has a specific role
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user, roles) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

// Get dashboard path based on role
export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.USER:
      return '/user/dashboard';
    case ROLES.STAFF:
      return '/staff/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    default:
      return '/';
  }
};

// Get role display name
export const getRoleDisplayName = (role) => {
  switch (role) {
    case ROLES.USER:
      return 'Donor';
    case ROLES.STAFF:
      return 'Staff';
    case ROLES.ADMIN:
      return 'Administrator';
    default:
      return 'Unknown';
  }
};

// Check if user can access a route
export const canAccessRoute = (user, allowedRoles) => {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
};

export default {
  ROLES,
  hasRole,
  hasAnyRole,
  getDashboardPath,
  getRoleDisplayName,
  canAccessRoute,
};
