import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Play, Pause, Volume2, VolumeX, 
  Cog, Expand, 
  SkipForward, SkipBack
} from 'lucide-react';
import { VideoQuality } from '@shared/schema';

interface VideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  hideControls?: boolean;
  onEnded?: () => void;
  loop?: boolean;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({ 
  src, 
  poster, 
  title,
  className, 
  autoPlay = false,
  hideControls = false,
  onEnded,
  loop = false
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressHandleRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>('720p');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onEnded]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    if (!progressBar || !videoRef.current) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    } else {
      container.requestFullscreen().then(() => setIsFullscreen(true));
    }
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg bg-black video-player',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
      >
        {src && <source src={src} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>

      {/* Video overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-70"></div>
      
      {/* Video title if provided */}
      {title && (
        <div className="absolute bottom-20 left-0 right-0 p-4 md:p-8 z-10">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{title}</h2>
        </div>
      )}

      {/* Video Controls */}
      {!hideControls && (
        <div 
          className={`video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#121212] to-transparent p-4 flex flex-col transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full h-1 bg-gray-600 rounded-full mb-3 relative cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full bg-[#E50914] rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <div 
              ref={progressHandleRef}
              className="absolute h-3 w-3 bg-[#E50914] rounded-full -top-1 transform -translate-x-1/2"
              style={{ left: `${progress}%` }}
            ></div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                className="text-white hover:text-[#E50914] transition"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <div className="relative group">
                <button 
                  className="text-white hover:text-[#E50914] transition"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#1E1E1E] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10 p-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full accent-[#E50914]"
                  />
                </div>
              </div>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button 
                  className="text-white hover:text-[#E50914] transition"
                  onClick={() => setShowQualitySettings(!showQualitySettings)}
                  aria-label="Settings"
                >
                  <Cog size={20} />
                </button>
                
                <div className={`absolute bottom-full right-0 mb-2 w-32 bg-[#1E1E1E] rounded shadow-lg transition-opacity duration-200 z-10 ${showQualitySettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  <div className="p-2">
                    <p className="text-xs text-[#AAAAAA] mb-1">Quality</p>
                    <div className="space-y-1">
                      <button 
                        className={`w-full text-left px-2 py-1 text-sm hover:bg-[#2D2D2D] rounded transition ${quality === '1080p' ? 'text-[#E50914]' : 'text-white'}`}
                        onClick={() => setQuality('1080p')}
                      >
                        1080p
                      </button>
                      <button 
                        className={`w-full text-left px-2 py-1 text-sm hover:bg-[#2D2D2D] rounded transition ${quality === '720p' ? 'text-[#E50914]' : 'text-white'}`}
                        onClick={() => setQuality('720p')}
                      >
                        720p
                      </button>
                      <button 
                        className={`w-full text-left px-2 py-1 text-sm hover:bg-[#2D2D2D] rounded transition ${quality === '480p' ? 'text-[#E50914]' : 'text-white'}`}
                        onClick={() => setQuality('480p')}
                      >
                        480p
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Removed Closed Captioning button as icon is not available */}
              
              <button 
                className="text-white hover:text-[#E50914] transition"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
              >
                <Expand size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
