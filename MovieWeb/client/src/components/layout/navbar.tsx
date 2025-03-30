import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link, useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, User, Upload, Film, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenAdminPanel: () => void;
  onOpenUploadModal?: () => void;
}

export default function Navbar({ onOpenAdminPanel, onOpenUploadModal }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState('home');
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('categoryChange', { detail: category }));
    }
  };

  const canUploadContent = user?.role === 'owner' || user?.role === 'member';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-primary text-2xl font-bold">Syfer-eng's Movies</h1>
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleCategoryClick('home')}
              className={`hover:text-primary transition ${activeCategory === 'home' ? 'text-primary font-medium' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleCategoryClick('movies')}
              className={`hover:text-primary transition ${activeCategory === 'movies' ? 'text-primary font-medium' : ''}`}
            >
              Movies
            </button>
            <button 
              onClick={() => handleCategoryClick('tv')}
              className={`hover:text-primary transition ${activeCategory === 'tv' ? 'text-primary font-medium' : ''}`}
            >
              TV Shows
            </button>
            <button 
              onClick={() => handleCategoryClick('new')}
              className={`hover:text-primary transition ${activeCategory === 'new' ? 'text-primary font-medium' : ''}`}
            >
              New & Popular
            </button>
            <button 
              onClick={() => handleCategoryClick('mylist')}
              className={`hover:text-primary transition ${activeCategory === 'mylist' ? 'text-primary font-medium' : ''}`}
            >
              My List
            </button>
            
            {canUploadContent && (
              <Button 
                onClick={onOpenUploadModal} 
                variant="outline" 
                size="sm"
                className="ml-4 bg-primary/10 hover:bg-primary/20 border-primary/50 text-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="text-text-primary hover:text-primary transition">
            <Search className="h-6 w-6" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black/80 backdrop-blur-md border-gray-800">
              {user?.isAdmin && (
                <DropdownMenuItem onClick={onOpenAdminPanel} className="cursor-pointer">
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
