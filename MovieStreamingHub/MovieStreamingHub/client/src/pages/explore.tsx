import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Movie, movieCategorySchema } from '@shared/schema';
import MovieGrid from '@/components/ui/movie-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

const Explore: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all movies
  const { data: allMovies = [], isLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies'],
    refetchOnWindowFocus: false,
  });
  
  // Filter by category and search
  const filteredMovies = allMovies.filter(movie => {
    // Match search query
    const matchesSearch = !searchQuery || 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Match category
    const matchesCategory = activeCategory === 'all' || movie.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get all categories with movie counts
  const categories = Object.values(movieCategorySchema.enum);
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = allMovies.filter(m => m.category === cat).length;
    return acc;
  }, {} as Record<string, number>);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search already happens on input change, this is just for form submission
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Explore Movies</h1>
        
        <form onSubmit={handleSearch} className="relative mb-8">
          <Input
            type="text"
            placeholder="Search by title or description..."
            className="bg-[#2D2D2D] text-[#E5E5E5] border-none rounded-full py-6 pl-12 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAAAAA]" size={20} />
        </form>
        
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-[#1E1E1E] border border-[#2D2D2D] p-1 rounded-full flex flex-wrap">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white rounded-full"
            >
              All ({allMovies.length})
            </TabsTrigger>
            
            {categories.map(category => (
              <TabsTrigger 
                key={category}
                value={category}
                className="data-[state=active]:bg-[#E50914] data-[state=active]:text-white rounded-full capitalize"
              >
                {category} ({categoryCounts[category] || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <MovieGrid 
              title={`All Movies${searchQuery ? ` - Search: "${searchQuery}"` : ''}`}
              movies={filteredMovies}
              isLoading={isLoading}
              emptyMessage={searchQuery ? `No movies found matching "${searchQuery}"` : "No movies available"}
            />
          </TabsContent>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <MovieGrid 
                title={`${category.charAt(0).toUpperCase() + category.slice(1)}${searchQuery ? ` - Search: "${searchQuery}"` : ''}`}
                movies={filteredMovies}
                isLoading={isLoading}
                emptyMessage={searchQuery ? `No ${category} movies found matching "${searchQuery}"` : `No ${category} movies available`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
