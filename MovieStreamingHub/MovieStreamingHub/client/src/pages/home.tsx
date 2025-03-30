import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import VideoPlayer from '@/components/ui/video-player';
import MovieGrid from '@/components/ui/movie-grid';
import { Movie } from '@shared/schema';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/ui-context';

const Home: React.FC = () => {
  const { openVideoModal } = useUI();
  
  // Fetch all movies
  const { data: allMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    refetchOnWindowFocus: false,
  });
  
  // Get featured movie - using the first movie for now
  const featuredMovie = allMovies.length > 0 ? allMovies[0] : null;
  
  // Filter movies by category/recency for different sections
  const recentlyUploaded = [...allMovies]
    .sort((a, b) => {
      const dateA = new Date(a.uploadedAt || '').getTime();
      const dateB = new Date(b.uploadedAt || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 5);
  
  // For demo purposes, just get arbitrary movies for trending section
  const trendingMovies = allMovies.slice(0, 5);
  
  return (
    <>
      {/* Featured Movie Section */}
      <section className="mb-12 px-4">
        <div className="container mx-auto relative">
          {featuredMovie ? (
            <div className="rounded-xl overflow-hidden relative video-player">
              <VideoPlayer
                poster={featuredMovie.thumbnailPath ? `/api/thumbnails/${featuredMovie.thumbnailPath.split('/').pop()}` : undefined}
                title={featuredMovie.title}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{featuredMovie.title}</h2>
                <p className="text-sm md:text-base text-[#AAAAAA] mb-4 max-w-2xl">
                  {featuredMovie.description || 'No description available.'}
                </p>
                
                <div className="flex items-center gap-3 mb-6">
                  {featuredMovie.category && (
                    <span className="px-2 py-1 rounded bg-[#2D2D2D] text-xs font-medium capitalize">
                      {featuredMovie.category}
                    </span>
                  )}
                  {featuredMovie.duration && (
                    <span className="text-[#AAAAAA] text-xs">
                      {Math.floor(featuredMovie.duration / 60)} min
                    </span>
                  )}
                  {featuredMovie.year && (
                    <span className="text-[#AAAAAA] text-xs">{featuredMovie.year}</span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-white hover:bg-gray-200 text-[#121212] font-medium px-6 py-2 rounded-full transition flex items-center"
                    onClick={() => openVideoModal(featuredMovie)}
                  >
                    <Play className="mr-2" size={16} /> Play
                  </Button>
                  <Button 
                    variant="outline"
                    className="bg-gray-700 bg-opacity-70 hover:bg-opacity-90 text-white border-none font-medium px-6 py-2 rounded-full transition flex items-center"
                  >
                    <Info className="mr-2" size={16} /> More Info
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="rounded-xl overflow-hidden bg-[#1E1E1E] aspect-video animate-pulse"></div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-[#1E1E1E] aspect-video flex items-center justify-center">
              <p className="text-[#AAAAAA]">No featured movies available</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Recently Uploaded Section */}
      <MovieGrid 
        title="Recently Uploaded" 
        movies={recentlyUploaded} 
        isLoading={isLoading} 
        emptyMessage="No recently uploaded movies"
      />
      
      {/* Get user's movies section */}
      <MovieGrid 
        title="My Uploads" 
        movies={allMovies.filter(m => m.userId === 1)} // Assuming user ID 1 for demo
        isLoading={isLoading}
        isUserUploads={true}
        emptyMessage="You haven't uploaded any movies yet"
      />
      
      {/* Trending Section */}
      <MovieGrid 
        title="Trending Now" 
        movies={trendingMovies}
        isLoading={isLoading}
        emptyMessage="No trending movies available"
      />
    </>
  );
};

export default Home;
