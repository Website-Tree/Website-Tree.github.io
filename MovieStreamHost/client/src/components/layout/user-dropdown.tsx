import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import { Link } from "wouter";
import { ChevronDown, UserCircle, LogOut, Settings } from "lucide-react";

interface UserDropdownProps {
  user: User;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logoutMutation } = useAuth();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Define role badge color
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case "owner":
        return "bg-[#F40612]";
      case "member":
        return "bg-[#B81D24]";
      default:
        return "bg-gray-600";
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-gray-200 focus:outline-none"
      >
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
          {user.profilePicture ? (
            <img 
              src={`${user.profilePicture}?v=${Date.now()}`} 
              alt={user.username} 
              className="h-full w-full object-cover" 
              onError={(e) => {
                // If image fails to load, show fallback
                (e.target as HTMLImageElement).onerror = null;
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = 
                  `<span class="text-sm font-medium text-white">${user.username.charAt(0).toUpperCase()}</span>`;
              }}
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1F1F1F] border border-gray-700 rounded-md shadow-lg py-1 z-10">
          <Link href="/account-settings">
            <a className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#B81D24] hover:text-white">
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </a>
          </Link>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-[#B81D24] hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
