import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, FilmIcon } from "lucide-react";
import { InsertMovie } from '@shared/schema';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadMovieFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const uploadMovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  videoUrl: z.string().url("Must be a valid URL"),
  thumbnailUrl: z.string().url("Must be a valid URL"),
  releaseYear: z.number().min(1900).max(new Date().getFullYear()),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  videoQuality: z.string().min(1, "Video quality is required"),
  featured: z.boolean().default(false)
});

type UploadMovieFormValues = z.infer<typeof uploadMovieSchema>;

export default function UploadMovieForm({ isOpen, onClose }: UploadMovieFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState('');
  
  const form = useForm<UploadMovieFormValues>({
    resolver: zodResolver(uploadMovieSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      videoUrl: '',
      thumbnailUrl: '',
      releaseYear: new Date().getFullYear(),
      durationMinutes: 90,
      videoQuality: '1080p',
      featured: false
    }
  });
  
  const uploadMovieMutation = useMutation({
    mutationFn: async (data: UploadMovieFormValues) => {
      // Convert the form data to match the InsertMovie type
      const movieData: InsertMovie = {
        title: data.title,
        description: data.description,
        category: data.category,
        videoUrl: data.videoUrl,
        thumbnailUrl: data.thumbnailUrl,
        releaseYear: data.releaseYear,
        durationMinutes: data.durationMinutes,
        featured: data.featured
      };
      
      const res = await apiRequest("POST", "/api/movies", movieData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
      toast({
        title: "Movie uploaded successfully",
        description: "Your movie has been added to the platform.",
        variant: "default",
      });
      form.reset();
      setImagePreview('');
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  function onSubmit(values: UploadMovieFormValues) {
    uploadMovieMutation.mutate(values);
  }
  
  // Handle thumbnail URL changes to update the preview
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    form.setValue('thumbnailUrl', url);
    setImagePreview(url);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-dark text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">Upload New Movie</DialogTitle>
          <DialogDescription>
            Add a new movie to the platform. Fill in all the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter movie title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter movie description" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Action Movies">Action Movies</SelectItem>
                          <SelectItem value="Trending Now">Trending Now</SelectItem>
                          <SelectItem value="New Releases">New Releases</SelectItem>
                          <SelectItem value="Comedy">Comedy</SelectItem>
                          <SelectItem value="Drama">Drama</SelectItem>
                          <SelectItem value="Horror">Horror</SelectItem>
                          <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                          <SelectItem value="Documentary">Documentary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="releaseYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1900} 
                            max={new Date().getFullYear()} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="videoQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Quality</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="720p">HD (720p)</SelectItem>
                          <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                          <SelectItem value="2k">2K</SelectItem>
                          <SelectItem value="4k">4K</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right column */}
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter thumbnail image URL" 
                          {...field}
                          onChange={handleThumbnailChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border border-dashed border-gray-600 rounded-lg p-2 h-[200px] flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Thumbnail preview" 
                      className="max-h-full max-w-full object-contain rounded" 
                      onError={() => setImagePreview('')}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FilmIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Thumbnail preview will appear here</p>
                    </div>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter video URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Feature this movie (will appear in highlights)</FormLabel>
                    </FormItem>
                  )}
                />
                
                <Alert className="my-4 bg-blue-950/30 border-blue-500/70">
                  <AlertTriangle className="h-4 w-4 text-blue-500" />
                  <AlertDescription>
                    Make sure you have the rights to distribute this content.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/80"
                disabled={uploadMovieMutation.isPending}
              >
                {uploadMovieMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Upload Movie
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}