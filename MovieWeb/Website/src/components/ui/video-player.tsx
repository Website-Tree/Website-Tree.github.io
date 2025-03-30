import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Play, Volume2, Maximize } from 'lucide-react';
import { Movie } from '@shared/schema';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

export default function VideoPlayer({ isOpen, onClose, movie }: VideoPlayerProps) {
  const [progress, setProgress] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const formattedCurrentTime = "00:45";
  const formattedTotalTime = "01:30:00";
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 bg-black border-none">
        <button 
          onClick={onClose}
          className="absolute top-0 right-0 -mt-12 text-text-primary hover:text-primary z-10"
        >
          <X className="h-8 w-8" />
        </button>
        
        <div className="relative overflow-hidden rounded">
          <div className="aspect-w-16 aspect-h-9 bg-dark-surface">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 mx-auto text-primary" />
                <p className="mt-4 text-lg">{movie.title}</p>
                <p className="text-sm text-gray-400">{movie.description}</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  className="text-text-primary hover:text-primary"
                  onClick={handlePlayPause}
                >
                  <Play className="h-6 w-6" />
                </button>
                
                <div className="text-sm">
                  <span>{formattedCurrentTime}</span> / <span>{formattedTotalTime}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="text-text-primary hover:text-primary">
                  <Volume2 className="h-6 w-6" />
                </button>
                
                <button className="text-text-primary hover:text-primary">
                  <Maximize className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="mt-2 px-1">
              <Slider
                defaultValue={[progress]}
                max={100}
                step={1}
                onValueChange={handleProgressChange}
                className="h-1"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
