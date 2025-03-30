import { LockIcon, AlertTriangleIcon, MailIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function LockScreen() {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 mx-auto space-y-6 bg-background rounded-lg border border-red-600">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-red-600/20">
            <LockIcon className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold">Account Has Been Locked</h1>
          
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-600/20 rounded-full">
            <AlertTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          
          <p className="text-muted-foreground">
            Your account has been locked by the administrator. Please contact support for assistance.
          </p>
          
          <div className="w-full p-4 bg-muted rounded-md space-y-3">
            <div className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm">Email: <span className="font-medium">244977@antigoschools.org</span></p>
            </div>
            
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm">After 4:20 PM: <span className="font-medium">Syfer.eng.github@gmail.com</span></p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}