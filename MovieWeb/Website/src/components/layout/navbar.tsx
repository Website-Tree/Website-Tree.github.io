import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Menu, 
  Search, 
  UserCircle, 
  LogOut, 
  Shield 
} from "lucide-react";

interface NavbarProps {
  onOpenAdminPanel: () => void;
}

export default function Navbar({ onOpenAdminPanel }: NavbarProps) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tighter">
              MoviesStream
            </span>
          </Link>
        </div>

        {!isMobile && (
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/">
              <a className={`transition-colors hover:text-foreground/80 ${
                location === "/" ? "text-foreground" : "text-foreground/60"
              }`}>
                Home
              </a>
            </Link>
            <Link href="/movies">
              <a className={`transition-colors hover:text-foreground/80 ${
                location === "/movies" ? "text-foreground" : "text-foreground/60"
              }`}>
                Movies
              </a>
            </Link>
            <Link href="/tv-shows">
              <a className={`transition-colors hover:text-foreground/80 ${
                location === "/tv-shows" ? "text-foreground" : "text-foreground/60"
              }`}>
                TV Shows
              </a>
            </Link>
            <Link href="/my-list">
              <a className={`transition-colors hover:text-foreground/80 ${
                location === "/my-list" ? "text-foreground" : "text-foreground/60"
              }`}>
                My List
              </a>
            </Link>
          </nav>
        )}
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          {!user ? (
            <Button asChild size="sm">
              <Link href="/auth">Sign In</Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem onClick={onOpenAdminPanel}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/">Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/movies">Movies</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tv-shows">TV Shows</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-list">My List</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}