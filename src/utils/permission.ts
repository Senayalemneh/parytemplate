interface Permission {
    id: number;
    name: string;
    key: string;  
    description: string;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Gets parsed permissions array from localStorage
   */
  export const getStoredPermissions = (): Permission[] => {
    try {
      const permissionsStr = localStorage.getItem('userPermissions');
      return permissionsStr ? JSON.parse(permissionsStr) : [];
    } catch (error) {
      console.error('Error parsing permissions:', error);
      return [];
    }
  };
  
  /**
   * Gets just the permission keys (string[]) from localStorage
   */
  export const getUserPermissionKeys = (): string[] => {
    return getStoredPermissions().map(p => p.key);
  };
  
  /**
   * Checks if user has ALL required permissions
   */
  export const hasAllPermissions = (requiredKeys: string[]): boolean => {
    if (requiredKeys.length === 0) return true;
    const userKeys = getUserPermissionKeys();
    return requiredKeys.every(key => userKeys.includes(key));
  };
  
  /**
   * Checks if user has ANY of the required permissions
   */
  export const hasAnyPermission = (requiredKeys: string[]): boolean => {
    const userKeys = getUserPermissionKeys();
    return requiredKeys.some(key => userKeys.includes(key));
  };