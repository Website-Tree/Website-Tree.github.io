import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import UsersPage from "@/pages/users-page";
import UploadPage from "@/pages/upload-page";
import WatchPage from "@/pages/watch-page";
import AccountSettingsPage from "@/pages/account-settings-page";
import MyListPage from "@/pages/my-list-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { AccountLockGuard } from "@/components/auth/account-lock-guard";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/watch/:id" component={WatchPage} />
      <Route path="/embed/:id">
        {(params) => <WatchPage id={params.id} embedded />}
      </Route>
      <Route path="/" component={HomePage} />
      <ProtectedRoute 
        path="/upload" 
        component={UploadPage} 
        requiredPermission="canUploadMovies" 
      />
      <ProtectedRoute 
        path="/users" 
        component={UsersPage} 
        requiredRole="owner" 
      />
      <ProtectedRoute 
        path="/account-settings" 
        component={AccountSettingsPage} 
      />
      <ProtectedRoute 
        path="/my-list" 
        component={MyListPage} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AccountLockGuard>
          <div className="flex flex-col min-h-screen bg-[#141414]">
            <Navbar />
            <div className="flex-grow">
              <Router />
            </div>
            <Footer />
          </div>
        </AccountLockGuard>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
