import React from 'react';
import MovieCard from './movie-card';
import { Movie } from '@shared/schema';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export default function MovieSection({ title, movies, onMovieClick }: MovieSectionProps) {
  return (
    <section className="mb-10">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            onClick={onMovieClick} 
          />
        ))}
      </div>
    </section>
  );
}
