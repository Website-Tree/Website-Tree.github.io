import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, UserRole } from "@shared/schema";
import { DeleteUserButton } from "./delete-user-button";
import { ChangeUserPassword } from "./change-user-password";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Edit, Trash, LockIcon, UnlockIcon, KeyRound } from "lucide-react";

export function UserTable() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: UserRole }) => {
      await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
      setShowRoleDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation for locking/unlocking user accounts
  const toggleLockMutation = useMutation({
    mutationFn: async ({ userId, isLocked }: { userId: number; isLocked: boolean }) => {
      await apiRequest("PATCH", `/api/users/${userId}/lock`, { isLocked });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: variables.isLocked ? "Account locked" : "Account unlocked",
        description: variables.isLocked 
          ? "User account has been locked successfully" 
          : "User account has been unlocked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update account status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleRoleChange = (role: string) => {
    if (!selectedUser) return;
    
    if (Object.values(UserRole).includes(role as UserRole)) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: role as UserRole,
      });
    }
  };
  
  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setShowRoleDialog(true);
  };
  
  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setShowPasswordDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-[#1F1F1F] rounded-lg">
        <p className="text-red-400">Error loading users: {error.message}</p>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="p-4 bg-[#1F1F1F] rounded-lg">
        <p className="text-gray-400">No users found.</p>
      </div>
    );
  }
  
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-[#F40612] text-white";
      case "member":
        return "bg-[#B81D24] text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };
  
  const formatDate = (dateString?: Date) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <>
      <div className="bg-[#1F1F1F] rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="text-gray-300">User</TableHead>
              <TableHead className="text-gray-300">Role</TableHead>
              <TableHead className="text-gray-300">Created</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-right text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-gray-700">
                <TableCell className="py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email || "No email"}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-400">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isLocked ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                    {user.isLocked ? 'Locked' : 'Active'}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {user.username === "Syfer-eng" ? (
                    <span className="text-gray-500">Cannot modify</span>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openRoleDialog(user)}
                        className="text-[#E50914] hover:text-[#B81D24]"
                        title="Edit role"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => toggleLockMutation.mutate({ userId: user.id, isLocked: !user.isLocked })}
                        className="text-[#E50914] hover:text-[#B81D24]"
                        title={user.isLocked ? "Unlock account" : "Lock account"}
                        disabled={toggleLockMutation.isPending}
                      >
                        {user.isLocked ? (
                          <UnlockIcon className="h-4 w-4" />
                        ) : (
                          <LockIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button 
                        onClick={() => openPasswordDialog(user)}
                        className="text-[#E50914] hover:text-[#B81D24]"
                        title="Reset password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <DeleteUserButton userId={user.id} username={user.username} />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Role change dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent className="bg-[#1F1F1F] text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Change the role for user {selectedUser?.username}. This will update their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <Select defaultValue={selectedUser?.role} onValueChange={handleRoleChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role} className={selectedUser?.role === role ? "bg-gray-700" : ""}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#E50914] hover:bg-[#B81D24]"
              disabled={updateRoleMutation.isPending}
              onClick={(e) => {
                // Prevent the form from closing automatically
                if (updateRoleMutation.isPending) {
                  e.preventDefault();
                }
              }}
            >
              {updateRoleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password change dialog */}
      {selectedUser && (
        <ChangeUserPassword
          userId={selectedUser.id}
          username={selectedUser.username}
          open={showPasswordDialog}
          onOpenChange={setShowPasswordDialog}
        />
      )}
    </>
  );
}
