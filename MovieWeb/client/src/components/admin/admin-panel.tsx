import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { InsertUser, User, UserRole } from '@shared/schema';
import { X, Search, Loader2, Users, AlertTriangle, UserPlus, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import UserListItem from './user-list-item';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [lockedUsers, setLockedUsers] = useState<Set<number>>(new Set());
  const [unlockedUsers, setUnlockedUsers] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('manage');
  
  // User creation form schema
  const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().refine(val => [UserRole.VISITOR, UserRole.MEMBER, UserRole.OWNER].includes(val as any), {
      message: "Invalid role selected"
    }),
    isAdmin: z.boolean().default(false),
  });

  // Form for creating new users
  const createUserForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: UserRole.VISITOR,
      isAdmin: false,
    },
  });
  
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isOpen,
  });
  
  const toggleLockMutation = useMutation({
    mutationFn: async ({ userId, isLocked }: { userId: number; isLocked: boolean }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/lock`, { isLocked });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to toggle lock status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Role Updated',
        description: `User's role has been updated to ${data.role}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update user role: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'User Deleted',
        description: 'The user has been permanently deleted.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete user: ${error.message}`,
        variant: 'destructive',
      });
      setIsDeleteDialogOpen(false);
    },
  });
  
  const handleToggleLock = (user: User) => {
    const newStatus = !user.isLocked;
    
    if (newStatus) {
      // User is being locked
      lockedUsers.add(user.id);
      unlockedUsers.delete(user.id);
    } else {
      // User is being unlocked
      unlockedUsers.add(user.id);
      lockedUsers.delete(user.id);
    }
    
    setLockedUsers(new Set(lockedUsers));
    setUnlockedUsers(new Set(unlockedUsers));
  };
  
  const handleChangeRole = (userId: number, role: string) => {
    changeRoleMutation.mutate({ userId, role });
  };
  
  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
    }
  };
  
  const handleSaveChanges = async () => {
    // Process locked users
    for (const userId of lockedUsers) {
      await toggleLockMutation.mutateAsync({ userId, isLocked: true });
    }
    
    // Process unlocked users
    for (const userId of unlockedUsers) {
      await toggleLockMutation.mutateAsync({ userId, isLocked: false });
    }
    
    // Clear pending changes
    setLockedUsers(new Set());
    setUnlockedUsers(new Set());
    
    toast({
      title: 'Success',
      description: 'User lock status changes have been saved.',
    });
  };
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const panelClasses = `fixed inset-y-0 right-0 w-full md:w-[500px] shadow-lg transform transition-transform duration-300 ease-in-out z-50 bg-[#1f1f1f] border-l-2 border-primary ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;
  
  return (
    <>
      <div className={panelClasses}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Admin Dashboard</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-primary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-4 flex-grow overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-white">User Management</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{users.length} users</span>
                </div>
              </div>
              
              <Alert className="mb-4 bg-amber-950/30 border-amber-500/70">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  Changes to user roles and deletions are permanent and take effect immediately.
                </AlertDescription>
              </Alert>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 bg-dark border border-gray-700 text-white"
                />
                <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-500" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
                  <UserListItem 
                    key={user.id}
                    user={user}
                    isPendingLock={lockedUsers.has(user.id)}
                    isPendingUnlock={unlockedUsers.has(user.id)}
                    onToggleLock={() => handleToggleLock(user)}
                    onChangeRole={handleChangeRole}
                    onDeleteUser={handleDeleteUser}
                  />
                ))}
                
                {filteredUsers.length === 0 && (
                  <p className="text-center py-4 text-gray-400">
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <Button 
              onClick={handleSaveChanges}
              className="w-full bg-primary hover:bg-red-700 text-white"
              disabled={lockedUsers.size === 0 && unlockedUsers.size === 0 || toggleLockMutation.isPending}
            >
              {toggleLockMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Lock Status Changes
            </Button>
          </div>
        </div>
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user account will be permanently deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteUser}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
