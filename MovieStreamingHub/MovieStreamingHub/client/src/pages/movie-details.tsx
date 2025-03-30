import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Movie } from '@shared/schema';
import VideoPlayer from '@/components/ui/video-player';
import { Button } from '@/components/ui/button';
import { Share2, Code, Clock, Calendar, Tag } from 'lucide-react';
import { useUI } from '@/contexts/ui-context';
import MovieGrid from '@/components/ui/movie-grid';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { openEmbedModal } = useUI();
  const movieId = parseInt(id);
  
  // Fetch the specific movie
  const { data: movie, isLoading: isLoadingMovie } = useQuery<Movie>({
    queryKey: [`/api/movies/${movieId}`],
    enabled: !isNaN(movieId),
  });
  
  // Fetch all movies for recommendations
  const { data: allMovies = [], isLoading: isLoadingAll } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });
  
  // Filter for related movies (same category)
  const relatedMovies = allMovies
    .filter(m => m.id !== movieId && m.category === movie?.category)
    .slice(0, 5);
  
  if (isLoadingMovie) {
    return (
      <div className="container mx-auto px-4 pt-8">
        <div className="bg-[#1E1E1E] rounded-lg aspect-video animate-pulse mb-6"></div>
        <div className="bg-[#1E1E1E] rounded-lg h-12 w-1/3 animate-pulse mb-4"></div>
        <div className="bg-[#1E1E1E] rounded-lg h-24 animate-pulse mb-8"></div>
      </div>
    );
  }
  
  if (!movie) {
    return (
      <div className="container mx-auto px-4 pt-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Movie Not Found</h1>
        <p className="text-[#AAAAAA]">The movie you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  const videoSrc = movie.filePath ? `/api/videos/${movie.filePath.split('/').pop()}` : undefined;
  const thumbnailSrc = movie.thumbnailPath ? `/api/thumbnails/${movie.thumbnailPath.split('/').pop()}` : undefined;
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: movie.description || `Check out ${movie.title} on StreamHub`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback when Web Share API is not available
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };
  
  return (
    <>
      <div className="container mx-auto px-4 pt-8">
        <div className="rounded-xl overflow-hidden mb-8">
          <VideoPlayer 
            src={videoSrc} 
            poster={thumbnailSrc} 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#AAAAAA] mb-6">
              {movie.year && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  <span>{movie.year}</span>
                </div>
              )}
              
              {movie.duration && (
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{Math.floor(movie.duration / 60)} min</span>
                </div>
              )}
              
              {movie.category && (
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" />
                  <span className="capitalize">{movie.category}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <span>Uploaded {new Date(movie.uploadedAt || '').toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Description</h2>
              <p className="text-[#AAAAAA]">{movie.description || 'No description available.'}</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                className="bg-[#2D2D2D] hover:bg-[#3D3D3D] text-white border-none"
                onClick={handleShare}
              >
                <Share2 className="mr-2" size={16} /> Share
              </Button>
              
              <Button 
                className="bg-[#0071EB] hover:bg-blue-700 text-white"
                onClick={() => openEmbedModal(movie)}
              >
                <Code className="mr-2" size={16} /> Get Embed Code
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-[#1E1E1E] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Movie Info</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#AAAAAA]">Uploader</span>
                  <span className="text-white">User ID: {movie.userId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#AAAAAA]">Upload Date</span>
                  <span className="text-white">{new Date(movie.uploadedAt || '').toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#AAAAAA]">Video Quality</span>
                  <span className="text-white">Up to 1080p</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#AAAAAA]">Visibility</span>
                  <span className="text-white">{movie.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Movies */}
      <MovieGrid 
        title="Related Movies" 
        movies={relatedMovies} 
        isLoading={isLoadingAll}
        emptyMessage="No related movies found"
      />
    </>
  );
};

export default MovieDetails;
