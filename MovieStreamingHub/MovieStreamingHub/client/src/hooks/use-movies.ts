import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Movie, insertMovieSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export const useMovies = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all movies
  const getAllMovies = () => {
    return useQuery<Movie[]>({
      queryKey: ['/api/movies'],
    });
  };
  
  // Get movie by ID
  const getMovie = (id: number) => {
    return useQuery<Movie>({
      queryKey: [`/api/movies/${id}`],
      enabled: !!id,
    });
  };
  
  // Get user's movies
  const getUserMovies = (userId: number) => {
    return useQuery<Movie[]>({
      queryKey: [`/api/users/${userId}/movies`],
      enabled: !!userId,
    });
  };
  
  // Delete a movie
  const useDeleteMovie = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await apiRequest('DELETE', `/api/movies/${id}`);
        return id;
      },
      onSuccess: (id) => {
        queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
        toast({
          title: 'Movie deleted',
          description: 'The movie has been deleted successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to delete movie',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      },
    });
  };
  
  // Update a movie
  const useUpdateMovie = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number, data: Partial<Movie> }) => {
        const response = await apiRequest('PUT', `/api/movies/${id}`, data);
        return response.json();
      },
      onSuccess: (updatedMovie) => {
        queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
        queryClient.invalidateQueries({ queryKey: [`/api/movies/${updatedMovie.id}`] });
        toast({
          title: 'Movie updated',
          description: 'The movie has been updated successfully.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Failed to update movie',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
      },
    });
  };
  
  return {
    getAllMovies,
    getMovie,
    getUserMovies,
    useDeleteMovie,
    useUpdateMovie,
  };
};
