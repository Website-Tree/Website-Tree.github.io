import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from '@/components/ui/video-player';
import { Movie } from '@shared/schema';

const Embed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  const [queryParams] = useState(() => new URLSearchParams(window.location.search));
  
  const movieId = parseInt(id);
  
  // Get embed options from URL params
  const autoplay = queryParams.get('autoplay') === 'true';
  const loop = queryParams.get('loop') === 'true';
  const hideControls = queryParams.get('controls') === 'false';
  const quality = queryParams.get('quality') || '720p';
  
  // Fetch the specific movie
  const { data: movie, isLoading, error } = useQuery<Movie>({
    queryKey: [`/api/movies/${movieId}`],
    enabled: !isNaN(movieId),
  });
  
  // Determine video sources based on selected quality
  const videoSrc = movie?.filePath 
    ? `/api/videos/${movie.filePath.split('/').pop()}`
    : undefined;
    
  const thumbnailSrc = movie?.thumbnailPath 
    ? `/api/thumbnails/${movie.thumbnailPath.split('/').pop()}`
    : undefined;
  
  // Set up full-height layout
  useEffect(() => {
    document.body.classList.add('overflow-hidden', 'h-screen', 'bg-black');
    return () => {
      document.body.classList.remove('overflow-hidden', 'h-screen', 'bg-black');
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse bg-[#1E1E1E] w-16 h-16 rounded-full"></div>
      </div>
    );
  }
  
  if (error || !movie) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-center p-4">
          <h2 className="text-white text-lg mb-2">Video Not Found</h2>
          <p className="text-[#AAAAAA] text-sm">This video may have been removed or is unavailable.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black p-0">
      <VideoPlayer
        src={videoSrc}
        poster={thumbnailSrc}
        className="w-full h-full"
        autoPlay={autoplay}
        hideControls={hideControls}
        loop={loop}
      />
    </div>
  );
};

export default Embed;
