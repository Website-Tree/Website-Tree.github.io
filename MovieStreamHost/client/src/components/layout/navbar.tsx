import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { UserDropdown } from "./user-dropdown";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, loginMutation, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we're on the embed page, don't show the navbar
  if (location.startsWith("/embed/")) {
    return null;
  }

  const navLinks = [
    { name: "Home", href: "/", visible: true },
    { name: "My List", href: "/my-list", visible: !!user },
    { name: "Upload", href: "/upload", visible: !!user && user.canUploadMovies },
    { name: "Users", href: "/users", visible: !!user && user.role === UserRole.OWNER }
  ];

  return (
    <nav className="bg-[#1F1F1F] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-[#E50914] text-2xl font-bold cursor-pointer">MovieStream</a>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => 
                link.visible && (
                  <Link key={link.name} href={link.href}>
                    <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location === link.href 
                        ? 'text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}>
                      {link.name}
                    </a>
                  </Link>
                )
              )}
            </div>
          </div>
          
          {/* User section */}
          <div className="flex items-center">
            <div className="hidden md:flex md:items-center">
              {user ? (
                <UserDropdown user={user} />
              ) : (
                <Link href="/auth">
                  <Button className="text-white bg-[#E50914] hover:bg-[#B81D24]">
                    Login
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">
                  {mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
                </span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => 
            link.visible && (
              <Link key={link.name} href={link.href}>
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === link.href 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </Link>
            )
          )}
          
          {!user && (
            <Link href="/auth">
              <a 
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#E50914] hover:bg-[#B81D24]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </a>
            </Link>
          )}
          
          {user && (
            <div className="px-3 py-2">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
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
                            `<span class="text-lg font-medium text-white">${user.username.charAt(0).toUpperCase()}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-lg font-medium text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-base font-medium text-white">{user.username}</div>
                  <div className="text-sm text-gray-400 capitalize">{user.role}</div>
                </div>
              </div>
              <Link href="/account-settings">
                <a
                  className="block mt-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </a>
              </Link>
              <Button
                variant="ghost"
                className="mt-3 w-full text-left text-gray-300 hover:text-white"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutMutation.mutate();
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
