import { useQuery } from "@tanstack/react-query";
import { MovieGrid } from "@/components/movies/movie-grid";
import { Movie } from "@shared/schema";

export default function HomePage() {
  const { 
    data: popularMovies,
    isLoading: isLoadingPopular,
    error: popularError
  } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });
  
  const { 
    data: recentMovies,
    isLoading: isLoadingRecent,
    error: recentError
  } = useQuery<Movie[]>({
    queryKey: ["/api/movies/recent"],
  });
  
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <MovieGrid
          title="Popular Movies"
          movies={popularMovies}
          isLoading={isLoadingPopular}
          error={popularError as Error | null}
          emptyMessage="No movies available. Be the first to upload!"
        />
        
        <MovieGrid
          title="Recently Added"
          movies={recentMovies}
          isLoading={isLoadingRecent}
          error={recentError as Error | null}
          emptyMessage="No recent movies. Upload some now!"
        />
      </div>
    </div>
  );
}
