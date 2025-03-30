import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function LockScreen() {
  const { logoutMutation } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto rounded-full bg-destructive/10 p-6">
            <LockIcon className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Account Locked
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account has been locked by an administrator.
            Please contact support for assistance.
          </p>
        </div>
        <Button variant="destructive" onClick={() => logoutMutation.mutate()}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}