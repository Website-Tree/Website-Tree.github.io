import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, Upload as UploadIcon, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { MovieCategory, movieCategorySchema } from '@shared/schema';
import { cn } from '@/lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MovieCategory | ''>('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [thumbnailDragActive, setThumbnailDragActive] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const categories = Object.values(movieCategorySchema.enum);

  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setVideoDragActive(true);
    } else if (e.type === 'dragleave') {
      setVideoDragActive(false);
    }
  };

  const handleThumbnailDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setThumbnailDragActive(true);
    } else if (e.type === 'dragleave') {
      setThumbnailDragActive(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a video file (MP4, MKV, MOV, AVI, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, GIF, etc.)",
          variant: "destructive"
        });
      }
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast({
        title: "Video file required",
        description: "Please upload a video file to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your movie",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      setUploadedBytes(0);
      setTotalBytes(videoFile.size);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      // Add metadata
      formData.append('title', title);
      formData.append('description', description);
      if (category) formData.append('category', category);
      formData.append('year', year);
      formData.append('userId', '1'); // Hard-coded for demo, should use actual user ID
      formData.append('isPublic', 'true');
      
      // Use XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          setUploadedBytes(event.loaded);
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Success
          queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
          queryClient.invalidateQueries({ queryKey: ['/api/users/1/movies'] });
          
          toast({
            title: "Upload successful",
            description: "Your movie has been uploaded successfully",
            variant: "default"
          });
          
          resetForm();
          onClose();
        } else {
          // Error
          toast({
            title: "Upload failed",
            description: `Error: ${xhr.statusText}`,
            variant: "destructive"
          });
        }
        setUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        toast({
          title: "Upload failed",
          description: "A network error occurred",
          variant: "destructive"
        });
        setUploading(false);
      });
      
      xhr.open('POST', '/api/movies', true);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setYear(new Date().getFullYear().toString());
    setVideoFile(null);
    setThumbnailFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
  };

  const handleCancel = () => {
    if (uploading) {
      // Show confirmation before canceling upload
      const confirmCancel = window.confirm("Are you sure you want to cancel the upload?");
      if (confirmCancel) {
        // In real implementation, would abort the XHR request
        resetForm();
        onClose();
      }
    } else {
      resetForm();
      onClose();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] text-[#E5E5E5] border-[#2D2D2D] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Upload Your Movie</DialogTitle>
          <DialogDescription className="text-[#AAAAAA]">
            Share your videos with the StreamHub community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#AAAAAA]">Movie Title</Label>
              <Input
                id="title"
                placeholder="Enter movie title"
                className="bg-[#2D2D2D] text-white border-none focus:ring-[#E50914]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#AAAAAA]">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter movie description"
                rows={3}
                className="bg-[#2D2D2D] text-white border-none focus:ring-[#E50914]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[#AAAAAA]">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as MovieCategory)}
                  disabled={uploading}
                >
                  <SelectTrigger className="bg-[#2D2D2D] text-white border-none focus:ring-[#E50914]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2D2D2D] text-white border-[#2D2D2D]">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="hover:bg-[#3D3D3D] focus:bg-[#3D3D3D]">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year" className="text-[#AAAAAA]">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="bg-[#2D2D2D] text-white border-none focus:ring-[#E50914]"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={uploading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Video File</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition",
                  videoDragActive ? "border-[#E50914] bg-[#E50914]/10" : "border-[#2D2D2D] hover:bg-[#2D2D2D]",
                  videoFile && "border-green-500"
                )}
                onDragEnter={handleVideoDrag}
                onDragOver={handleVideoDrag}
                onDragLeave={handleVideoDrag}
                onDrop={handleVideoDrop}
                onClick={() => videoInputRef.current?.click()}
              >
                {videoFile ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-green-500/20 text-green-500 p-2 rounded-full mb-2">
                      <Upload size={24} />
                    </div>
                    <p className="text-white font-medium">{videoFile.name}</p>
                    <p className="text-[#AAAAAA] text-xs mt-1">{formatBytes(videoFile.size)}</p>
                    <Button
                      type="button" 
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoFile(null);
                      }}
                      disabled={uploading}
                    >
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadIcon className="h-10 w-10 text-[#AAAAAA] mx-auto mb-2" />
                    <p className="text-[#AAAAAA]">Drag and drop your file here or click to browse</p>
                    <p className="text-[#AAAAAA] text-xs mt-2">Supported formats: MP4, MKV, MOV, AVI (Max 10GB)</p>
                  </>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  className="hidden"
                  accept="video/mp4,video/x-matroska,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleVideoChange}
                  disabled={uploading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#AAAAAA]">Thumbnail</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition",
                  thumbnailDragActive ? "border-[#E50914] bg-[#E50914]/10" : "border-[#2D2D2D] hover:bg-[#2D2D2D]",
                  thumbnailFile && "border-green-500"
                )}
                onDragEnter={handleThumbnailDrag}
                onDragOver={handleThumbnailDrag}
                onDragLeave={handleThumbnailDrag}
                onDrop={handleThumbnailDrop}
                onClick={() => thumbnailInputRef.current?.click()}
              >
                {thumbnailFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-full max-h-32 overflow-hidden rounded mb-2">
                      <img 
                        src={URL.createObjectURL(thumbnailFile)} 
                        alt="Thumbnail preview" 
                        className="w-full object-contain"
                      />
                    </div>
                    <p className="text-white font-medium">{thumbnailFile.name}</p>
                    <p className="text-[#AAAAAA] text-xs mt-1">{formatBytes(thumbnailFile.size)}</p>
                    <Button
                      type="button" 
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnailFile(null);
                      }}
                      disabled={uploading}
                    >
                      <X size={14} className="mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Image className="h-10 w-10 text-[#AAAAAA] mx-auto mb-2" />
                    <p className="text-[#AAAAAA]">Upload a thumbnail image</p>
                    <p className="text-[#AAAAAA] text-xs mt-2">Recommended: 16:9 ratio (1280×720 or higher)</p>
                  </>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={uploading}
                />
              </div>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#AAAAAA]">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-[#2D2D2D] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E50914] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#AAAAAA]">
                  <span>{formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}</span>
                  <span>Uploading...</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              className="text-[#AAAAAA] hover:text-white hover:bg-[#2D2D2D]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#E50914] hover:bg-red-700 text-white"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
