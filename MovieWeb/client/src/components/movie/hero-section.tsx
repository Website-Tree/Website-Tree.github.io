import React, { useState, useEffect } from 'react';
import { Movie } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Play, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface HeroSectionProps {
  movie: Movie;
  onPlayClick: () => void;
}

export default function HeroSection({ movie, onPlayClick }: HeroSectionProps) {
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
  
  const handleAddToList = async () => {
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
        toast({
          title: "Removed from My List",
          description: `${movie.title} has been removed from your list`
        });
      } else {
        // Add to list
        await apiRequest('POST', `/api/user/my-list/${movie.id}`);
        setIsSaved(true);
        toast({
          title: "Added to My List",
          description: `${movie.title} has been added to your list`
        });
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
    <div className="relative w-full h-[50vh] md:h-[70vh] rounded-lg overflow-hidden my-6">
      <img 
        src={movie.thumbnailUrl} 
        alt={movie.title} 
        className="w-full h-full object-cover" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3">
        <h2 className="text-3xl md:text-5xl font-bold mb-3">{movie.title}</h2>
        <p className="text-text-secondary text-sm md:text-base mb-4 line-clamp-3">
          {movie.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-dark-surface bg-opacity-70 rounded-full text-xs">{movie.category}</span>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={onPlayClick}
            className="bg-primary hover:bg-red-700 flex items-center space-x-2"
          >
            <Play className="h-5 w-5" />
            <span>Play</span>
          </Button>
          <Button 
            onClick={handleAddToList}
            variant="secondary" 
            disabled={isLoading}
            className={`flex items-center space-x-2 ${isSaved ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'}`}
          >
            <Star className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            <span>
              {isLoading 
                ? 'Updating...' 
                : isSaved 
                  ? 'Added to My List' 
                  : 'Add to My List'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
