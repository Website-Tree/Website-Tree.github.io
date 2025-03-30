import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Movie } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import LockScreen from "@/components/lock-screen";
import HeroSection from "@/components/movie/hero-section";
import MovieSection from "@/components/movie/movie-section";
import AdminPanel from "@/components/admin/admin-panel";

export default function HomePage() {
  const { user } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Show lock screen if the user is locked
  if (user?.isLocked) {
    return <LockScreen />;
  }

  const { data: featuredMovies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies/featured"],
  });

  const { data: actionMovies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies/category", "Action"],
  });

  const { data: comedyMovies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies/category", "Comedy"],
  });

  const { data: dramaMovies = [] } = useQuery<Movie[]>({
    queryKey: ["/api/movies/category", "Drama"],
  });

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlaying(false);
  };

  const handlePlayMovie = () => {
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenAdminPanel={() => setIsAdminPanelOpen(true)} />
      
      <main>
        {/* Hero section with featured movie */}
        {featuredMovies.length > 0 && (
          <HeroSection 
            movie={featuredMovies[0]} 
            onPlayClick={handlePlayMovie} 
          />
        )}
        
        {/* Movie sections */}
        <div className="container py-8 space-y-10">
          <MovieSection
            title="Popular Movies"
            movies={featuredMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieSection
            title="Action"
            movies={actionMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieSection
            title="Comedy"
            movies={comedyMovies}
            onMovieClick={handleMovieClick}
          />
          
          <MovieSection
            title="Drama"
            movies={dramaMovies}
            onMovieClick={handleMovieClick}
          />
        </div>
      </main>
      
      {/* Movie player dialog */}
      <Dialog 
        open={!!selectedMovie && isPlaying} 
        onOpenChange={(open) => !open && setIsPlaying(false)}
      >
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          {selectedMovie && (
            <div className="aspect-video">
              <iframe
                src={selectedMovie.videoUrl}
                title={selectedMovie.title}
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Movie details dialog */}
      <Dialog
        open={!!selectedMovie && !isPlaying}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
      >
        <DialogContent className="max-w-2xl">
          {selectedMovie && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-md">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedMovie.genre}
                </span>
                <span className="text-sm text-muted-foreground">
                  {selectedMovie.category}
                </span>
                {selectedMovie.year && (
                  <span className="text-sm text-muted-foreground">
                    {selectedMovie.year}
                  </span>
                )}
                {selectedMovie.duration && (
                  <span className="text-sm text-muted-foreground">
                    {selectedMovie.duration} min
                  </span>
                )}
              </div>
              
              <p className="text-muted-foreground">
                {selectedMovie.description}
              </p>
              
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsPlaying(true)}
                >
                  Play
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Admin panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}