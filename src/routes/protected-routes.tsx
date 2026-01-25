import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { hasAnyPermission } from "../utils/permission";
import { hasAllPermissions } from "../utils/permission";
interface ProtectedRouteProps {
  children: ReactNode;
  allowedPermissions: string[];  
  redirectPath?: string;
  checkMode?: 'all' | 'any';    
}

const ProtectedRoute = ({ 
  children, 
  allowedPermissions = [], 
  redirectPath = "/unauthorized",
  checkMode = 'any'  
}: ProtectedRouteProps) => {
  
  const hasPermission = checkMode === 'all'
    ? hasAllPermissions(allowedPermissions)
    : hasAnyPermission(allowedPermissions);

  if (!hasPermission) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;