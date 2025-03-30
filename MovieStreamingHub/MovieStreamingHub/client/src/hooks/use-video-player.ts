import { useState, useRef, useEffect } from 'react';
import { VideoQuality } from '@shared/schema';

interface UseVideoPlayerOptions {
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  onEnded?: () => void;
}

export const useVideoPlayer = ({
  src,
  autoPlay = false,
  loop = false,
  onEnded,
}: UseVideoPlayerOptions = {}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quality, setQuality] = useState<VideoQuality>('720p');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };
    const handleError = (e: Event) => {
      setError('Error loading video');
      setIsLoading(false);
      console.error('Video error:', e);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    
    // Set initial values
    video.loop = loop;
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [loop, onEnded]);
  
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
  
  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  
  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const seekByPercentage = (percentage: number) => {
    if (videoRef.current && duration) {
      const newTime = duration * (percentage / 100);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (!document.fullscreenElement) {
      video.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error attempting to exit full-screen mode:', err);
      });
    }
  };
  
  const changeQuality = (newQuality: VideoQuality) => {
    // In a real implementation, this would switch video sources
    setQuality(newQuality);
  };
  
  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    quality,
    isLoading,
    error,
    togglePlay,
    toggleMute,
    changeVolume,
    seek,
    seekByPercentage,
    toggleFullscreen,
    changeQuality,
  };
};
