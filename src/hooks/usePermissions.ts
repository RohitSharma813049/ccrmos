import { useState, useEffect } from "react";

export function usePermissions() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setSession(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  const hasPermission = (moduleName: string, action: string) => {
    if (!session || !session.user) return false;
    const { hierarchyLevel, permissions } = session.user;

    // Owners and Founders bypass checks
    if (hierarchyLevel !== undefined && hierarchyLevel <= 2) return true;

    if (!permissions) return false;

    if (Array.isArray(permissions)) {
      return permissions.includes("all") || permissions.includes(moduleName);
    }

    if (permissions["all"]) return true;
    
    return !!permissions[moduleName]?.[action.toLowerCase()];
  };

  return { session, loading, hasPermission };
}
