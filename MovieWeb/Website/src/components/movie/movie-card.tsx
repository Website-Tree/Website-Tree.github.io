import { Movie } from "@shared/schema";
import { Play } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card className="overflow-hidden group cursor-pointer transition-all hover:ring-2 hover:ring-primary" onClick={() => onClick(movie)}>
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img 
            src={movie.posterUrl} 
            alt={movie.title}
            className="object-cover w-full h-full"
          />
        </AspectRatio>
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button size="icon" variant="ghost" className="rounded-full bg-primary/20 text-primary hover:bg-primary/30">
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-semibold truncate">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="text-muted-foreground text-sm">
            {movie.genre.split(',')[0]}
          </div>
          <Badge variant="outline" className="text-xs">{movie.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}