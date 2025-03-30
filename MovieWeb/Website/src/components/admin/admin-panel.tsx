import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { X } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import UserListItem from "./user-list-item";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [lockedUsers, setLockedUsers] = useState<Record<number, boolean>>({});

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isOpen, // Only fetch when panel is open
  });

  // Toggle user lock status
  const lockUserMutation = useMutation({
    mutationFn: async ({ userId, isLocked }: { userId: number; isLocked: boolean }) => {
      const res = await fetch(`/api/users/${userId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update user lock status");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const handleToggleLock = (user: User) => {
    setLockedUsers({
      ...lockedUsers,
      [user.id]: true,
    });
    
    lockUserMutation.mutate(
      { userId: user.id, isLocked: !user.isLocked },
      {
        onSuccess: () => {
          setLockedUsers({
            ...lockedUsers,
            [user.id]: false,
          });
        },
        onError: () => {
          setLockedUsers({
            ...lockedUsers,
            [user.id]: false,
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Admin Panel</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="users" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="stats">Site Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="flex-1 min-h-0">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading users...
                  </div>
                ) : users && users.length > 0 ? (
                  users.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      isPendingLock={!!lockedUsers[user.id]}
                      isPendingUnlock={!!lockedUsers[user.id]}
                      onToggleLock={() => handleToggleLock(user)}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Active Users</h3>
                <div className="text-3xl font-bold">{users?.length || 0}</div>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Locked Accounts</h3>
                <div className="text-3xl font-bold">
                  {users?.filter(user => user.isLocked).length || 0}
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <h3 className="font-medium mb-2">Admin Accounts</h3>
                <div className="text-3xl font-bold">
                  {users?.filter(user => user.isAdmin).length || 0}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}