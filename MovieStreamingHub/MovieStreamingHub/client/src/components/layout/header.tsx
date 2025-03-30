import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Upload, ChevronDown, Menu, X } from 'lucide-react';
import { useUI } from '@/contexts/ui-context';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const Header: React.FC = () => {
  const [location] = useLocation();
  const { openUploadModal } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      "border-b border-[#2D2D2D]",
      scrolled ? "bg-[#121212] shadow-md" : "bg-[#1E1E1E]"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-8">
              <h1 className="text-[#E50914] text-2xl font-bold">StreamHub</h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className={cn(
                  "text-[#E5E5E5] hover:text-[#E50914] transition",
                  isActive('/') && "text-[#E50914]"
                )}
              >
                Home
              </Link>
              <Link 
                href="/my-library" 
                className={cn(
                  "text-[#E5E5E5] hover:text-[#E50914] transition",
                  isActive('/my-library') && "text-[#E50914]"
                )}
              >
                My Library
              </Link>
              <Link 
                href="/explore" 
                className={cn(
                  "text-[#E5E5E5] hover:text-[#E50914] transition",
                  isActive('/explore') && "text-[#E50914]"
                )}
              >
                Explore
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <form 
              onSubmit={handleSearch}
              className="relative hidden md:block"
            >
              <Input
                type="text"
                placeholder="Search movies..."
                className="bg-[#2D2D2D] text-[#E5E5E5] border-none rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AAAAAA]" size={16} />
            </form>
            
            <button 
              onClick={() => openUploadModal()}
              className="bg-[#E50914] hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition"
            >
              <Upload className="mr-2" size={16} /> Upload
            </button>
            
            <div className="relative hidden md:block">
              <button className="flex items-center text-[#E5E5E5] hover:text-[#E50914] transition">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <ChevronDown className="ml-2" size={14} />
              </button>
            </div>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger className="md:hidden">
                <Menu className="text-[#E5E5E5]" />
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#1E1E1E] border-[#2D2D2D] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-[#2D2D2D]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-[#E5E5E5]">Menu</h2>
                    </div>
                    
                    <div className="mb-4">
                      <Input
                        type="text"
                        placeholder="Search movies..."
                        className="bg-[#2D2D2D] text-[#E5E5E5] border-none rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-7 top-[82px] transform -translate-y-1/2 text-[#AAAAAA]" size={16} />
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4">
                    <ul className="space-y-4">
                      <li>
                        <Link 
                          href="/" 
                          className={cn(
                            "block py-2 text-[#E5E5E5] hover:text-[#E50914] transition text-lg",
                            isActive('/') && "text-[#E50914]"
                          )}
                        >
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/my-library" 
                          className={cn(
                            "block py-2 text-[#E5E5E5] hover:text-[#E50914] transition text-lg",
                            isActive('/my-library') && "text-[#E50914]"
                          )}
                        >
                          My Library
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/explore" 
                          className={cn(
                            "block py-2 text-[#E5E5E5] hover:text-[#E50914] transition text-lg",
                            isActive('/explore') && "text-[#E50914]"
                          )}
                        >
                          Explore
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  
                  <div className="p-4 border-t border-[#2D2D2D]">
                    <div className="flex items-center">
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover mr-3" 
                      />
                      <div>
                        <p className="font-medium text-[#E5E5E5]">User123</p>
                        <p className="text-xs text-[#AAAAAA]">user@example.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar - toggle display */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search movies..."
              className="bg-[#2D2D2D] text-[#E5E5E5] border-none rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#AAAAAA]" size={16} />
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
