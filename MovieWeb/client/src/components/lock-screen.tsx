import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function LockScreen() {
  const { logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center px-4 max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center">
          <Lock className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-white">Account Locked</h2>
        <p className="text-gray-400 mb-2">
          Your account has been locked by the administrator.
        </p>
        <p className="text-gray-400 mb-8">
          Please contact Syfer-eng at <span className="text-primary">244977@antigoschools.org</span> or <span className="text-primary">syfer.eng.github@gmail.com</span> after 4:20 for assistance.
        </p>
        <Button 
          onClick={handleLogout} 
          className="bg-primary hover:bg-red-700 text-white px-6 py-2"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
