import { useState } from "react";
import { Link } from "wouter";
import { PlayCircle } from "lucide-react";
import { type Movie } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Helper to generate placeholder image if thumbnail is missing
  const getImageUrl = () => {
    if (movie.thumbnailUrl) {
      return movie.thumbnailUrl;
    }
    // Fallback to placeholder image
    return `https://placehold.co/480x270/1F1F1F/FFFFFF?text=${encodeURIComponent(movie.title)}`;
  };

  return (
    <Link href={`/watch/${movie.id}`}>
      <div 
        className={cn(
          "movie-card bg-[#1F1F1F] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-video">
          <img 
            src={getImageUrl()} 
            alt={movie.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
          
          {/* Hover overlay with play icon */}
          <div 
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <PlayCircle className="h-12 w-12 text-[#E50914]" />
          </div>
          
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-sm font-bold truncate">{movie.title}</p>
          </div>
        </div>
        <div className="p-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{movie.year || "Unknown"}</span>
            <span className="text-xs px-1.5 py-0.5 bg-[#E50914] rounded-sm">{movie.quality || "HD"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
