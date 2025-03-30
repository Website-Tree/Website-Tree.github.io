import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { CustomVideoPlayer } from "@/components/ui/custom-video-player";
import { Movie } from "@shared/schema";
import { CopyButton } from "@/components/ui/copy-button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Separator
} from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface WatchPageProps {
  id?: string;
  embedded?: boolean;
}

export default function WatchPage({ id: propId, embedded = false }: WatchPageProps) {
  const params = useParams();
  const [location] = useLocation();
  const id = propId || params.id;
  const [isClient, setIsClient] = useState(false);

  // Format duration helper
  const formatDuration = (duration?: string) => {
    if (!duration) return "";
    return duration;
  };

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get movie data
  const { 
    data: movie, 
    isLoading, 
    error 
  } = useQuery<Movie>({
    queryKey: [`/api/movies/${id}`],
  });

  // Generate embed code based on current URL
  const generateEmbedCode = () => {
    if (!movie) return "";
    const baseUrl = window.location.origin;
    return `<iframe src="${baseUrl}/embed/${movie.id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
  };

  // Generate direct link
  const generateDirectLink = () => {
    if (!movie) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/watch/${movie.id}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-[#E50914]" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <div className="bg-[#1F1F1F] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Video Not Found</h2>
          <p className="text-gray-400">
            The movie you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Embedded player view
  if (embedded) {
    return isClient ? (
      <div className="w-full h-screen bg-black">
        <CustomVideoPlayer
          src={`/api/stream/${movie.id}`}
          poster={movie.thumbnailUrl}
          title={movie.title}
          className="w-full h-full"
        />
      </div>
    ) : null; // Return null during SSR for embedded view
  }

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
          {movie.year && (
            <p className="text-gray-400">
              {movie.year} • {formatDuration(movie.duration)} • {movie.quality || 'HD'}
            </p>
          )}
        </div>

        <div className="bg-black rounded-lg overflow-hidden">
          {isClient && (
            <CustomVideoPlayer
              src={`/api/stream/${movie.id}`}
              poster={movie.thumbnailUrl}
              className="w-full aspect-video"
            />
          )}
        </div>

        <Card className="mt-4 bg-[#1F1F1F] border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-grow">
                <h2 className="text-xl font-semibold text-white mb-2">About this movie</h2>
                <p className="text-gray-300">{movie.description || "No description available."}</p>
              </div>
              
              {/* Share section */}
              <div className="md:w-1/3 space-y-4">
                <h3 className="text-lg font-medium text-white">Share</h3>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Embed Code</p>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={generateEmbedCode()} 
                      readOnly 
                      className="flex-grow bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-1 text-sm"
                    />
                    <CopyButton value={generateEmbedCode()} label="" size="sm" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Direct Link</p>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={generateDirectLink()} 
                      readOnly 
                      className="flex-grow bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-1 text-sm"
                    />
                    <CopyButton value={generateDirectLink()} label="" size="sm" />
                  </div>
                </div>
              </div>
            </div>

            {movie.uploaderId && (
              <>
                <Separator className="my-4 bg-gray-700" />
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-white">U</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Uploaded by user ID: {movie.uploaderId}</p>
                    <p className="text-xs text-gray-500">
                      {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : "Unknown date"}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
