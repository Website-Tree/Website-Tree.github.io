import { useEffect, useRef, useState } from "react";
import { 
  Play, Pause, Volume2, Volume1, VolumeX, 
  Maximize, Minimize
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onEnded?: () => void;
}

export function CustomVideoPlayer({
  src,
  poster,
  title,
  className,
  onEnded,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onDurationChange = () => {
      setDuration(video.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("ended", onEnded);
    };
  }, [onEnded]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle controls auto-hide
  useEffect(() => {
    const showControls = () => {
      setIsControlsVisible(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", showControls);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setIsControlsVisible(false);
        }
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", showControls);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Play/pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Error playing video:", error);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      
      if (newMuted) {
        // Save the current volume before muting
        videoRef.current.dataset.previousVolume = videoRef.current.volume.toString();
        videoRef.current.volume = 0;
      } else {
        // Restore the previous volume
        const previousVolume = parseFloat(videoRef.current.dataset.previousVolume || "1");
        videoRef.current.volume = previousVolume;
        setVolume(previousVolume);
      }
    }
  };

  // Seek functionality
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressContainerRef.current || !videoRef.current) return;

    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercentage = clickX / rect.width;
    
    videoRef.current.currentTime = progressPercentage * duration;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format time display
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Volume icon based on volume level
  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-black aspect-video rounded-lg",
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full"
        onClick={togglePlay}
        playsInline
      />
      
      {/* Custom Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center mb-2">
          <button 
            onClick={togglePlay}
            className="text-white mr-4 focus:outline-none"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <div className="flex-grow relative">
            <div 
              ref={progressContainerRef}
              className="h-1 bg-gray-700 rounded cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-1 bg-primary rounded" 
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="text-white text-sm ml-4">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="ml-4 relative">
            <button 
              className="text-white focus:outline-none"
              onClick={toggleMute}
              onMouseEnter={() => setIsVolumeSliderVisible(true)}
              onMouseLeave={() => setIsVolumeSliderVisible(false)}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <VolumeIcon size={20} />
            </button>
            
            <div 
              className={cn(
                "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-[#1F1F1F] rounded shadow-lg transition-opacity duration-200",
                isVolumeSliderVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onMouseEnter={() => setIsVolumeSliderVisible(true)}
              onMouseLeave={() => setIsVolumeSliderVisible(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-primary"
                aria-label="Volume"
              />
            </div>
          </div>
          
          <button 
            className="text-white ml-4 focus:outline-none"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
      
      {/* Play/Pause overlay for video area */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={togglePlay}
      >
        {!isPlaying && (
          <div className="bg-black/40 rounded-full p-4 transition-opacity duration-300">
            <Play size={32} className="text-white" />
          </div>
        )}
      </div>
      
      {/* Video title if provided */}
      {title && (
        <div className="absolute top-4 left-4 right-4">
          <h2 className="text-white text-lg font-bold truncate">{title}</h2>
        </div>
      )}
    </div>
  );
}
