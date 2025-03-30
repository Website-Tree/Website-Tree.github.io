import React, { useState, useEffect } from 'react';
import { Movie } from '@shared/schema';
import { Play, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if movie is already in user's list when component mounts
  useEffect(() => {
    if (user && movie.savedByUsers) {
      setIsSaved(movie.savedByUsers.includes(user.id.toString()));
    }
  }, [movie, user]);
  
  // Stop event propagation on the star button to prevent movie from playing
  const handleStarClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save movies to your list",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSaved) {
        // Remove from list
        await apiRequest('DELETE', `/api/user/my-list/${movie.id}`);
        setIsSaved(false);
      } else {
        // Add to list
        await apiRequest('POST', `/api/user/my-list/${movie.id}`);
        setIsSaved(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your list",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      className="relative rounded overflow-hidden cursor-pointer movie-card"
      onClick={() => onClick(movie)}
    >
      <img 
        src={movie.thumbnailUrl} 
        alt={movie.title} 
        className="w-full h-40 object-cover" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
        <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition">
          <Play className="h-6 w-6" />
        </button>
        <button 
          className={`rounded-full p-2 transition ${isSaved ? 'bg-yellow-500' : 'bg-white bg-opacity-20 hover:bg-opacity-30'}`}
          onClick={handleStarClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Star className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
        <h3 className="text-sm font-semibold truncate">{movie.title}</h3>
      </div>
    </div>
  );
}
