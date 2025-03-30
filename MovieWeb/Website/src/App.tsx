import { useState } from "react";
import { Route, Switch } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminPanel from "@/components/admin/admin-panel";

function AppContent() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  return (
    <>
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
      
      <Switch>
        <ProtectedRoute 
          path="/" 
          component={() => <HomePage onOpenAdminPanel={() => setIsAdminPanelOpen(true)} />} 
        />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
      
      <Toaster />
    </>
  );
}

function AppWithProviders() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default AppWithProviders;