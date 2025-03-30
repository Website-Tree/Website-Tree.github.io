import { Card, CardContent } from "@/components/ui/card";
import { LoginForm, RegisterForm } from "@/components/auth/auth-forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { VerificationForm } from "@/components/auth/verification-form";

export default function AuthPage() {
  const { user, isLoading, needsVerification, clearVerification } = useAuth();
  
  // Redirect if user is already logged in
  if (!isLoading && user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-dark-surface rounded-lg overflow-hidden shadow-lg">
        <div className="md:w-1/2 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary">StreamMoves</h1>
            <p className="text-text-secondary mt-2">Watch your favorite moves anytime, anywhere.</p>
          </div>
          
          {needsVerification ? (
            <div className="w-full">
              <VerificationForm
                userId={needsVerification.userId}
                onCancel={clearVerification}
              />
            </div>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
        
        <div className="hidden md:block md:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-dark-surface to-transparent z-10"></div>
          <div className="h-full bg-primary/20 flex items-center justify-center p-12 relative">
            <div className="relative z-20 text-center">
              <h2 className="text-4xl font-bold mb-4 text-primary">Ultimate Movie Experience</h2>
              <p className="text-text-primary text-lg mb-6">Unlimited access to thousands of movies and TV shows.</p>
              <ul className="text-text-secondary space-y-2 text-left">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Watch on any device
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  HD availability
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel anytime
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
