import React, { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import HeroSection from '@/components/movie/hero-section';
import MovieSection from '@/components/movie/movie-section';
import VideoPlayer from '@/components/ui/video-player';
import AdminPanel from '@/components/admin/admin-panel';
import UploadMovieForm from '@/components/movie/upload-movie-form';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@shared/schema';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
  });
  
  // Filter movies based on category selection
  const filteredMovies = selectedCategory 
    ? movies?.filter(movie => {
        if (selectedCategory === 'movies') return true; // All movies
        if (selectedCategory === 'tv') return movie.category === 'TV Shows';
        if (selectedCategory === 'new') return movie.category === 'New Releases';
        if (selectedCategory === 'mylist') return false; // My list not implemented yet
        return true;
      }) 
    : movies;
  
  const trendingMovies = movies?.filter(movie => movie.category === 'Trending Now') || [];
  const actionMovies = movies?.filter(movie => movie.category === 'Action Movies') || [];
  
  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsVideoPlayerOpen(true);
  };
  
  const handleOpenAdminPanel = () => {
    setIsAdminPanelOpen(true);
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  // Listen for category changes from the navbar
  React.useEffect(() => {
    const handleCategoryChange = (event: any) => {
      const category = event.detail;
      setSelectedCategory(category === 'home' ? null : category);
    };
    
    window.addEventListener('categoryChange', handleCategoryChange);
    return () => {
      window.removeEventListener('categoryChange', handleCategoryChange);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark text-text-primary">
      <Navbar 
        onOpenAdminPanel={handleOpenAdminPanel} 
        onOpenUploadModal={handleOpenUploadModal}
      />
      
      <main className="container mx-auto pt-20 px-4 pb-10">
        {trendingMovies.length > 0 && (
          <HeroSection movie={trendingMovies[0]} onPlayClick={() => handleMovieClick(trendingMovies[0])} />
        )}
        
        {trendingMovies.length > 0 && !selectedCategory && (
          <MovieSection 
            title="Trending Now" 
            movies={trendingMovies} 
            onMovieClick={handleMovieClick} 
          />
        )}
        
        {actionMovies.length > 0 && (!selectedCategory || selectedCategory === 'movies') && (
          <MovieSection 
            title="Action Movies" 
            movies={actionMovies}
            onMovieClick={handleMovieClick} 
          />
        )}

        {selectedCategory === 'mylist' && (
          <div className="my-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">My List</h2>
            <p className="text-muted-foreground">You haven't added any movies to your list yet.</p>
          </div>
        )}
      </main>
      
      {selectedMovie && (
        <VideoPlayer 
          isOpen={isVideoPlayerOpen} 
          onClose={() => setIsVideoPlayerOpen(false)} 
          movie={selectedMovie} 
        />
      )}
      
      {/* Admin panel with fullscreen overlay */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsAdminPanelOpen(false)}></div>
      )}
      <AdminPanel 
        isOpen={isAdminPanelOpen} 
        onClose={() => setIsAdminPanelOpen(false)} 
      />

      {/* Upload Movie Modal */}
      <UploadMovieForm
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
