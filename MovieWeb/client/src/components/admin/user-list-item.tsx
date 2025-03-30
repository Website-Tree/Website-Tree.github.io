import React, { useState } from 'react';
import { User, UserRole } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, UserCog, Trash2, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserListItemProps {
  user: User;
  isPendingLock: boolean;
  isPendingUnlock: boolean;
  onToggleLock: () => void;
  onChangeRole?: (userId: number, role: string) => void;
  onDeleteUser?: (userId: number) => void;
}

export default function UserListItem({ 
  user, 
  isPendingLock,
  isPendingUnlock,
  onToggleLock,
  onChangeRole,
  onDeleteUser
}: UserListItemProps) {
  const isCurrentlyLocked = isPendingLock ? true : 
                           isPendingUnlock ? false : 
                           user.isLocked;
  
  // Format role name for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };
  
  // Get color for role badge
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case UserRole.OWNER:
        return "text-red-500";
      case UserRole.MEMBER:
        return "text-blue-500";
      default:
        return "text-gray-400";
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-dark rounded">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarFallback className="bg-gray-700 text-gray-100">
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-white">{user.username}</p>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getRoleBadgeClass(user.role)}`}>
              {formatRole(user.role)}
            </span>
            {user.isAdmin && (
              <span className="text-sm text-yellow-500 ml-1">(Admin)</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={onToggleLock}
          size="sm"
          variant="outline"
          className={isCurrentlyLocked 
            ? "border-green-500 text-green-500 hover:bg-green-500/10" 
            : "border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
          }
          disabled={user.role === UserRole.OWNER} // Cannot lock owner
        >
          {isCurrentlyLocked ? (
            <>
              <Unlock className="h-4 w-4 mr-1" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Lock
            </>
          )}
        </Button>
        
        {/* User Management Dropdown */}
        {(onChangeRole || onDeleteUser) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                <UserCog className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {onChangeRole && (
                <>
                  <DropdownMenuItem
                    onClick={() => onChangeRole(user.id, UserRole.OWNER)}
                    disabled={user.role === UserRole.OWNER}
                    className="flex items-center"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-red-500" />
                    <span className={user.role === UserRole.OWNER ? "opacity-50" : ""}>
                      Promote to Owner
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => onChangeRole(user.id, UserRole.MEMBER)}
                    disabled={user.role === UserRole.MEMBER}
                    className="flex items-center"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-blue-500" />
                    <span className={user.role === UserRole.MEMBER ? "opacity-50" : ""}>
                      Set as Member
                    </span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={() => onChangeRole(user.id, UserRole.VISITOR)}
                    disabled={user.role === UserRole.VISITOR}
                    className="flex items-center"
                  >
                    <UserCheck className="mr-2 h-4 w-4 text-gray-500" />
                    <span className={user.role === UserRole.VISITOR ? "opacity-50" : ""}>
                      Set as Visitor
                    </span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                </>
              )}
              
              {onDeleteUser && (
                <DropdownMenuItem
                  onClick={() => onDeleteUser(user.id)}
                  className="text-red-500 focus:text-red-500 flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
