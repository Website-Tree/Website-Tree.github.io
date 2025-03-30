import React from 'react';
import { useLocation } from 'wouter';
import { Play, Share2, MoreVertical, Edit } from 'lucide-react';
import { Movie } from '@shared/schema';
import { cn } from '@/lib/utils';
import { useUI } from '@/contexts/ui-context';

interface MovieCardProps {
  movie: Movie;
  isUserUpload?: boolean;
  className?: string;
  onShare?: () => void;
  onEdit?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  isUserUpload = false,
  className,
  onShare,
  onEdit
}) => {
  const [, navigate] = useLocation();
  const { openVideoModal } = useUI();
  
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openVideoModal(movie);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openVideoModal(movie);
  };
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) onShare();
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };
  
  // Fallback thumbnail if none provided
  const thumbnailUrl = movie.thumbnailPath 
    ? `/api/thumbnails/${movie.thumbnailPath.split('/').pop()}`
    : 'https://via.placeholder.com/450x253/1E1E1E/AAAAAA?text=No+Thumbnail';
  
  const formattedDuration = formatDuration(movie.duration);
  
  return (
    <div 
      className={cn(
        "movie-card bg-[#1E1E1E] rounded-lg overflow-hidden cursor-pointer",
        "transition transform hover:scale-105 hover:shadow-lg",
        className
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-video">
        <img 
          src={thumbnailUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60"></div>
        
        {isUserUpload && (
          <div className="absolute top-2 right-2 bg-[#E50914] text-white text-xs px-2 py-1 rounded">
            My Upload
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 text-xs font-medium text-white bg-[#2D2D2D] bg-opacity-70 rounded px-1">
          {formattedDuration}
        </div>
        
        <button 
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition bg-[#121212] bg-opacity-50"
          onClick={handlePlayClick}
        >
          <div className="bg-[#E50914] bg-opacity-90 text-white rounded-full p-3">
            <Play size={16} />
          </div>
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-white truncate">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[#AAAAAA] text-xs">{movie.year || new Date(movie.uploadedAt || '').getFullYear()}</span>
          <div className="flex space-x-2">
            <button 
              className="text-[#AAAAAA] hover:text-[#E50914] text-xs"
              onClick={handleShareClick}
              aria-label="Share"
            >
              <Share2 size={14} />
            </button>
            
            {isUserUpload ? (
              <button 
                className="text-[#AAAAAA] hover:text-[#E50914] text-xs"
                onClick={handleEditClick}
                aria-label="Edit"
              >
                <Edit size={14} />
              </button>
            ) : (
              <button 
                className="text-[#AAAAAA] hover:text-[#E50914] text-xs"
                aria-label="More options"
              >
                <MoreVertical size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
