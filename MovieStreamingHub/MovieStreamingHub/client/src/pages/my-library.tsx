import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@shared/schema';
import MovieGrid from '@/components/ui/movie-grid';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { useUI } from '@/contexts/ui-context';

const MyLibrary: React.FC = () => {
  const { openUploadModal } = useUI();
  
  // Fetch user's movies - hardcoded to user ID 1 for demo
  const { data: userMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/users/1/movies'],
    refetchOnWindowFocus: false,
  });
  
  // Organize movies by category
  const moviesByCategory: Record<string, Movie[]> = {};
  
  userMovies.forEach(movie => {
    const category = movie.category || 'Uncategorized';
    
    if (!moviesByCategory[category]) {
      moviesByCategory[category] = [];
    }
    
    moviesByCategory[category].push(movie);
  });
  
  // Sort categories
  const sortedCategories = Object.keys(moviesByCategory).sort();
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <Button 
          className="bg-[#E50914] hover:bg-red-700 text-white"
          onClick={openUploadModal}
        >
          <UploadCloud className="mr-2" size={16} /> Upload New
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-8">
          <MovieGrid title="Loading..." movies={[]} isLoading={true} />
        </div>
      ) : userMovies.length === 0 ? (
        <div className="bg-[#1E1E1E] rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Your library is empty</h2>
          <p className="text-[#AAAAAA] mb-6">Start by uploading your first movie</p>
          <Button 
            className="bg-[#E50914] hover:bg-red-700 text-white"
            onClick={openUploadModal}
          >
            <UploadCloud className="mr-2" size={16} /> Upload Movie
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* All uploads section */}
          <MovieGrid 
            title="All Uploads" 
            movies={userMovies} 
            isUserUploads={true} 
          />
          
          {/* Sections by category */}
          {sortedCategories.map(category => (
            <MovieGrid 
              key={category}
              title={category.charAt(0).toUpperCase() + category.slice(1)} 
              movies={moviesByCategory[category]} 
              isUserUploads={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
