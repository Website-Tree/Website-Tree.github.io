import React from 'react';
import MovieCard from './movie-card';
import { Movie } from '@shared/schema';
import { useUI } from '@/contexts/ui-context';
import { Skeleton } from './skeleton';

interface MovieGridProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  isUserUploads?: boolean;
  emptyMessage?: string;
}

const MovieGrid: React.FC<MovieGridProps> = ({ 
  title, 
  movies, 
  isLoading = false,
  isUserUploads = false,
  emptyMessage = "No movies found"
}) => {
  const { openEmbedModal } = useUI();
  
  const handleShareMovie = (movie: Movie) => {
    openEmbedModal(movie);
  };
  
  return (
    <section className="mb-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-3 bg-[#1E1E1E] space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isUserUpload={isUserUploads}
                onShare={() => handleShareMovie(movie)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
            <p className="text-[#AAAAAA]">{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieGrid;
