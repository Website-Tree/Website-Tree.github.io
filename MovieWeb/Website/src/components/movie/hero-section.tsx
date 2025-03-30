import { Movie } from "@shared/schema";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  movie: Movie;
  onPlayClick: () => void;
}

export default function HeroSection({ movie, onPlayClick }: HeroSectionProps) {
  return (
    <div className="relative h-[70vh] flex items-end">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${movie.posterUrl})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 py-12">
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genre.split(',').map((genre: string, index: number) => (
              <Badge key={index} variant="secondary">
                {genre.trim()}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            {movie.title}
          </h1>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span>{movie.year ? movie.year : ''}</span>
            <span>HD</span>
            {movie.duration && <span>{movie.duration} min</span>}
          </div>
          
          <p className="text-lg mb-6 max-w-prose text-muted-foreground">
            {movie.description}
          </p>
          
          <Button size="lg" onClick={onPlayClick} className="gap-2">
            <Play className="h-5 w-5" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
}