import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AuthForms } from "@/components/auth/auth-forms";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  // Don't render anything while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // If not logged in, show auth page
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Form Section */}
      <div className="flex w-full flex-col justify-center p-6 md:w-1/2 md:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome to MoviesStream</h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one
            </p>
          </div>
          
          <AuthForms />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="hidden bg-muted md:flex md:w-1/2 md:items-center md:justify-center">
        <div className="max-w-md p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Unlimited movies, TV shows, and more
          </h2>
          <p className="mb-6 text-muted-foreground">
            Watch anywhere. Cancel anytime. Join today and get access to
            exclusive content only available on MoviesStream.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Movies</div>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">TV Shows</div>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">4K</div>
              <div className="text-sm text-muted-foreground">HD Quality</div>
            </div>
            <div className="rounded-lg bg-background p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-primary">$9.99</div>
              <div className="text-sm text-muted-foreground">Per Month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}