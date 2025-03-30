import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MovieGrid } from "@/components/movies/movie-grid";
import { Movie, UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MyListPage() {
  const { user } = useAuth();
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);
  
  // Get user's movies
  const { 
    data: myMovies,
    isLoading: isLoadingMyMovies,
    error: myMoviesError
  } = useQuery<Movie[]>({
    queryKey: ["/api/my-movies"],
    enabled: !!user,
  });
  
  // Get all available movies
  const { 
    data: allMovies,
    isLoading: isLoadingAllMovies,
    error: allMoviesError
  } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
    enabled: !!user,
  });
  
  // Get role-specific empty message
  const getEmptyMessage = () => {
    if (!user) return "Please log in to view your movie list.";
    
    switch(user.role) {
      case UserRole.OWNER:
        return "Your list is empty. Add some movies by uploading them!";
      case UserRole.MEMBER:
        return "Your list is empty. Add some movies by uploading them or by picking them!";
      case UserRole.VISITOR:
        return "Your list is empty. Add some!";
      default:
        return "Your list is empty.";
    }
  };
  
  // Add a movie to the user's list
  const addToMyList = async (movieId: number) => {
    try {
      await apiRequest("POST", `/api/my-list/add/${movieId}`);
      // Add to selected movies array for immediate UI feedback
      setSelectedMovies(prev => [...prev, movieId]);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/my-movies"] });
    } catch (error) {
      console.error("Failed to add movie to list:", error);
    }
  };
  
  // Remove a movie from the user's list
  const removeFromMyList = async (movieId: number) => {
    try {
      await apiRequest("DELETE", `/api/my-list/remove/${movieId}`);
      // Remove from selected movies array for immediate UI feedback
      setSelectedMovies(prev => prev.filter(id => id !== movieId));
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/my-movies"] });
    } catch (error) {
      console.error("Failed to remove movie from list:", error);
    }
  };
  
  // Filter movies that aren't already in the user's list
  const getAvailableMovies = () => {
    if (!allMovies || !myMovies) return [];
    const myMovieIds = myMovies.map(movie => movie.id);
    return allMovies.filter(movie => !myMovieIds.includes(movie.id));
  };
  
  const availableMovies = getAvailableMovies();
  
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* My Movie List */}
        <MovieGrid
          title="My Movie List"
          movies={myMovies}
          isLoading={isLoadingMyMovies}
          error={myMoviesError as Error | null}
          emptyMessage={getEmptyMessage()}
          onRemoveMovie={removeFromMyList}
          showRemoveButton={true}
        />
        
        {/* Available Movies to Add */}
        <Card className="bg-[#1F1F1F] border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Available Movies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAllMovies ? (
              <div className="text-center py-4">Loading available movies...</div>
            ) : availableMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {availableMovies.map(movie => (
                  <div key={movie.id} className="relative bg-[#141414] rounded-lg overflow-hidden shadow-md">
                    <img 
                      src={movie.thumbnailUrl || `https://placehold.co/480x270/1F1F1F/FFFFFF?text=${encodeURIComponent(movie.title)}`}
                      alt={movie.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="p-2">
                      <h3 className="text-white text-sm font-medium truncate">{movie.title}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="mt-2 w-full text-[#E50914] hover:text-white hover:bg-[#E50914]"
                        onClick={() => addToMyList(movie.id)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add to My List
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No more movies available to add to your list.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}