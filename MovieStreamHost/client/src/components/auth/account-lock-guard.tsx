import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LockScreen } from "./lock-screen";

interface AccountLockGuardProps {
  children: ReactNode;
}

export function AccountLockGuard({ children }: AccountLockGuardProps) {
  const { user } = useAuth();
  
  // If the user is locked (and is not the owner), show the lock screen
  if (user?.isLocked && user?.role !== "owner") {
    return <LockScreen />;
  }
  
  // Otherwise, render children normally
  return <>{children}</>;
}