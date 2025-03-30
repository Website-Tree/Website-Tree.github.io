import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import VideoPlayer from "@/components/ui/video-player";
import { Button } from "@/components/ui/button";
import { Movie } from '@shared/schema';
import { useUI } from '@/contexts/ui-context';
import { ThumbsUp, Share2, Code, X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, movie }) => {
  const { openEmbedModal } = useUI();
  const [liked, setLiked] = useState(false);
  
  if (!movie) return null;
  
  const videoSrc = movie.filePath ? `/api/videos/${movie.filePath.split('/').pop()}` : undefined;
  const thumbnailSrc = movie.thumbnailPath ? `/api/thumbnails/${movie.thumbnailPath.split('/').pop()}` : undefined;
  
  const handleEmbedClick = () => {
    onClose();
    openEmbedModal(movie);
  };
  
  const handleLike = () => {
    setLiked(!liked);
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description || `Check out ${movie.title} on StreamHub`,
          url: `${window.location.origin}/movies/${movie.id}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback when Web Share API is not available
      const url = `${window.location.origin}/movies/${movie.id}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-transparent border-none p-0 h-auto">
        <div className="relative w-full">
          <button 
            className="absolute -top-10 right-0 text-white hover:text-[#E50914] transition"
            onClick={onClose}
          >
            <X size={24} />
          </button>
          
          <div className="rounded-lg overflow-hidden">
            <VideoPlayer 
              src={videoSrc} 
              poster={thumbnailSrc}
            />
            
            <div className="bg-[#1E1E1E] p-4">
              <h3 className="text-xl font-semibold text-white mb-2">{movie.title}</h3>
              <div className="flex items-center text-[#AAAAAA] text-sm mb-3">
                <span className="mr-3">{movie.year || new Date(movie.uploadedAt || '').getFullYear()}</span>
                {movie.category && <span className="mr-3 capitalize">{movie.category}</span>}
                {movie.duration && <span>{Math.floor(movie.duration / 60)} min</span>}
              </div>
              
              <p className="text-[#AAAAAA] mb-4">{movie.description || 'No description available.'}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-[#AAAAAA] hover:text-white hover:bg-[#2D2D2D] ${liked ? 'text-[#E50914]' : ''}`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className="mr-1" size={16} /> 
                    <span>{liked ? 'Liked' : 'Like'}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#AAAAAA] hover:text-white hover:bg-[#2D2D2D]"
                    onClick={handleShare}
                  >
                    <Share2 className="mr-1" size={16} /> Share
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0071EB] hover:text-blue-400 hover:bg-[#2D2D2D]"
                  onClick={handleEmbedClick}
                >
                  <Code className="mr-1" size={16} /> Embed
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
