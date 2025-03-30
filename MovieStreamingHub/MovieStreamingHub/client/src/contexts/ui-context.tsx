import React, { createContext, useState, useContext, ReactNode } from 'react';
import UploadModal from '@/components/upload-modal';
import EmbedModal from '@/components/embed-modal';
import VideoModal from '@/components/video-modal';
import { Movie } from '@shared/schema';

interface UIContextType {
  openUploadModal: () => void;
  openEmbedModal: (movie: Movie) => void;
  openVideoModal: (movie: Movie) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  const openUploadModal = () => {
    setIsUploadModalOpen(true);
  };
  
  const openEmbedModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsEmbedModalOpen(true);
  };
  
  const openVideoModal = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsVideoModalOpen(true);
  };
  
  return (
    <UIContext.Provider 
      value={{ 
        openUploadModal,
        openEmbedModal,
        openVideoModal,
      }}
    >
      {children}
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      <EmbedModal 
        isOpen={isEmbedModalOpen} 
        onClose={() => setIsEmbedModalOpen(false)} 
        movie={selectedMovie} 
      />
      
      <VideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        movie={selectedMovie} 
      />
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
