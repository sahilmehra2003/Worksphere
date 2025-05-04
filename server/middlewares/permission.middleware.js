
import { Permissions, rolePermissions } from '../config/permission.config.js'; 

export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
      if (!req.user || !req.user.role) {
           console.warn("checkRole middleware run without authenticated user or user role.");
         return res.status(401).json({ success: false, message: 'Authentication required with role information.' });
      }

      const userRole = req.user.role;

      if (allowedRoles.includes(userRole)) {
          next(); 
      } else {
          console.warn(`Forbidden: User role '${userRole}' not in allowed roles [${allowedRoles.join(', ')}] for route ${req.originalUrl}`);
          return res.status(403).json({ success: false, message: 'Forbidden: You do not have the necessary role for this action.' });
      }
  };
};


export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
      // Check if user is authenticated and has a role attached
      if (!req.user || !req.user.role) {
          console.warn("checkPermission middleware run without authenticated user or user role.");
          return res.status(401).json({ success: false, message: 'Authentication required with role information.' });
      }

      const userRole = req.user.role;

      // Look up the permissions assigned to this user's role in the central map
      const permissionsForRole = rolePermissions[userRole] || []; // Default to empty array if role not found

      // Check if the required permission is included in the list for their role
      if (permissionsForRole.includes(requiredPermission)) {
          next(); // User's role has the required permission, proceed
      } else {
           console.warn(`Forbidden: Role '${userRole}' does not have required permission '${requiredPermission}' for route ${req.originalUrl}`);
          return res.status(403).json({ success: false, message: 'Forbidden: You do not have the necessary permission for this action.' });
      }

      // --- Optional: Add logic here later if you implement individual overridePermissions ---
      // const userOverrides = req.user.overridePermissions || [];
      // if (permissionsForRole.includes(requiredPermission) || userOverrides.includes(requiredPermission)) {
      //    next();
      // } else { ... }
      // --- End Optional Override Logic ---

  };
};


export const isManagerOrHR = checkRole(['Manager', 'HR', 'Admin']);

export const canApproveLeaves = checkPermission(Permissions.APPROVE_LEAVES);


export const canManageCalendar = checkPermission(Permissions.MANAGE_CALENDAR);


export const canManageCycles = checkPermission(Permissions.MANAGE_PERFORMANCE_CYCLES);