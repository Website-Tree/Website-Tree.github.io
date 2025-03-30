import { LockIcon, UnlockIcon, Loader2, UserIcon, ShieldIcon } from "lucide-react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserListItemProps {
  user: User;
  isPendingLock: boolean;
  isPendingUnlock: boolean;
  onToggleLock: () => void;
}

export default function UserListItem({ 
  user, 
  isPendingLock, 
  isPendingUnlock, 
  onToggleLock 
}: UserListItemProps) {
  const isLoading = user.isLocked ? isPendingUnlock : isPendingLock;
  
  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-md border",
      user.isLocked && "bg-destructive/10"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          user.isAdmin ? "bg-primary/20" : "bg-muted"
        )}>
          {user.isAdmin ? (
            <ShieldIcon className="w-4 h-4 text-primary" />
          ) : (
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <div className="font-medium">
            {user.username}
            {user.isAdmin && (
              <span className="ml-2 inline-block text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
                Admin
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {user.isLocked ? "Account locked" : "Account active"}
          </div>
        </div>
      </div>
      
      <Button
        variant={user.isLocked ? "outline" : "destructive"}
        size="sm"
        onClick={onToggleLock}
        disabled={isLoading || user.isAdmin} // Don't allow locking admin accounts
        title={user.isAdmin ? "Admin accounts cannot be locked" : ""}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : user.isLocked ? (
          <>
            <UnlockIcon className="h-4 w-4 mr-1" />
            Unlock
          </>
        ) : (
          <>
            <LockIcon className="h-4 w-4 mr-1" />
            Lock
          </>
        )}
      </Button>
    </div>
  );
}