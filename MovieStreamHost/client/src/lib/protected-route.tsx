import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { UserRole } from "@shared/schema";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: UserRole;
  requiredPermission?: "canCreateUsers" | "canDeleteUsers" | "canUploadMovies";
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check if the user has the required role
        if (requiredRole && user.role !== requiredRole) {
          return <Redirect to="/" />;
        }

        // Check if the user has the required permission
        if (requiredPermission && !user[requiredPermission]) {
          return <Redirect to="/" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
