import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { AuthForms } from "@/components/auth/auth-forms";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already logged in, no need to render the page
  if (user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row items-center p-4 md:p-8">
      <div className="w-full lg:w-1/2 max-w-md mx-auto lg:mx-0">
        <AuthForms />
      </div>

      <div className="w-full lg:w-1/2 p-6 lg:p-12 hidden lg:block">
        <div className="bg-[#1F1F1F] rounded-lg shadow-xl p-8 h-full">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to MovieStream</h1>
          <h2 className="text-xl font-semibold text-[#E50914] mb-6">Your personal movie streaming platform</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <i className="fas fa-film text-[#E50914]"></i>
              </div>
              <div>
                <h3 className="text-white font-medium">Stream Your Movies</h3>
                <p className="text-gray-400 text-sm">Watch your favorite movies anytime, anywhere</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <i className="fas fa-upload text-[#E50914]"></i>
              </div>
              <div>
                <h3 className="text-white font-medium">Upload Your Content</h3>
                <p className="text-gray-400 text-sm">Members can upload and share their own movies</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <i className="fas fa-share-alt text-[#E50914]"></i>
              </div>
              <div>
                <h3 className="text-white font-medium">Embed Videos</h3>
                <p className="text-gray-400 text-sm">Get embed codes to share your movies anywhere</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <i className="fas fa-user-shield text-[#E50914]"></i>
              </div>
              <div>
                <h3 className="text-white font-medium">Role-Based Access</h3>
                <p className="text-gray-400 text-sm">Owner, Member, and Visitor roles with different permissions</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gradient-to-r from-[#1F1F1F] to-[#141414] p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm italic">
              "MovieStream provides a seamless way to organize and share your personal movie collection."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
