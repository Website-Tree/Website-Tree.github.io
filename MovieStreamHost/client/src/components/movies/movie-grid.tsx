import { MovieCard } from "./movie-card";
import { Loader2, MinusCircle } from "lucide-react";
import { type Movie } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface MovieGridProps {
  title: string;
  movies: Movie[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  emptyMessage?: string;
  onRemoveMovie?: (movieId: number) => void;
  showRemoveButton?: boolean;
}

export function MovieGrid({ 
  title, 
  movies, 
  isLoading, 
  error,
  emptyMessage = "No movies found.",
  onRemoveMovie,
  showRemoveButton = false
}: MovieGridProps) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#E50914]" />
        </div>
      ) : error ? (
        <div className="bg-[#1F1F1F] rounded-lg p-6 text-center">
          <p className="text-red-400">Error loading movies: {error.message}</p>
        </div>
      ) : !movies || movies.length === 0 ? (
        <div className="bg-[#1F1F1F] rounded-lg p-6 text-center">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="relative">
              <MovieCard movie={movie} />
              {showRemoveButton && onRemoveMovie && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 p-1 h-8 w-8"
                  onClick={() => onRemoveMovie(movie.id)}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
