import { Movie } from "@shared/schema";
import MovieCard from "./movie-card";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
}

export default function MovieSection({ title, movies, onMovieClick }: MovieSectionProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => onMovieClick(movie)}
          />
        ))}
      </div>
    </section>
  );
}