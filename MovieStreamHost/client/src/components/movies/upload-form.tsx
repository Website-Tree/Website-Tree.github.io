import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CopyButton } from "@/components/ui/copy-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, UploadCloud, Film, Image } from "lucide-react";

const currentYear = new Date().getFullYear();

const uploadFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  year: z
    .number()
    .int()
    .min(1900, "Year must be at least 1900")
    .max(currentYear, `Year cannot be in the future (max: ${currentYear})`)
    .optional()
    .or(z.string().transform(value => (value === "" ? undefined : parseInt(value, 10))))
    .optional(),
  quality: z.string().optional(),
  video: z.instanceof(FileList).refine(files => files.length === 1, {
    message: "Video file is required",
  }),
  thumbnail: z.instanceof(FileList).optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface UploadResponse {
  id: number;
  title: string;
  embedCode: string;
  directLink: string;
}

export function UploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadSuccess, setUploadSuccess] = useState<UploadResponse | null>(null);
  
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      year: undefined,
      quality: "HD 1080p",
    },
  });
  
  const uploadMovie = useMutation({
    mutationFn: async (data: UploadFormValues) => {
      const formData = new FormData();
      formData.append("title", data.title);
      
      if (data.description) {
        formData.append("description", data.description);
      }
      
      if (data.year) {
        formData.append("year", data.year.toString());
      }
      
      if (data.quality) {
        formData.append("quality", data.quality);
      }
      
      // Add video file
      if (data.video[0]) {
        formData.append("video", data.video[0]);
      }
      
      // Add thumbnail if provided
      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }
      
      const response = await fetch("/api/movies", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload movie");
      }
      
      return await response.json();
    },
    onSuccess: (data: UploadResponse) => {
      setUploadSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/movies/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-movies"] });
      
      toast({
        title: "Upload successful!",
        description: "Your movie has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: UploadFormValues) => {
    uploadMovie.mutate(values);
  };
  
  const resetForm = () => {
    form.reset();
    setUploadSuccess(null);
  };
  
  if (!user || !user.canUploadMovies) {
    return (
      <Card className="bg-[#1F1F1F]">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Unauthorized</h3>
          <p className="text-gray-300">You don't have permission to upload movies.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (uploadSuccess) {
    return (
      <Card className="bg-[#1F1F1F]">
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold text-[#4BB543] mb-4">Upload Successful!</h3>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-300 mb-2">Embed Code</Label>
            <div className="relative">
              <Input 
                value={uploadSuccess.embedCode} 
                readOnly 
                className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <CopyButton value={uploadSuccess.embedCode} size="sm" />
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-gray-300 mb-2">Direct Link</Label>
            <div className="relative">
              <Input 
                value={uploadSuccess.directLink} 
                readOnly 
                className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <CopyButton value={uploadSuccess.directLink} size="sm" />
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              onClick={resetForm}
              className="bg-[#E50914] hover:bg-[#B81D24]"
            >
              Upload Another Movie
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#1F1F1F]">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Movie Title</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-gray-800 border-gray-700 text-white focus-visible:ring-[#E50914]" 
                    />
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
                  <FormLabel className="text-white">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      className="bg-gray-800 border-gray-700 text-white focus-visible:ring-[#E50914]" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Release Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1900"
                        max={currentYear}
                        {...field}
                        value={field.value || ''}
                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                        className="bg-gray-800 border-gray-700 text-white focus-visible:ring-[#E50914]" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Quality</FormLabel>
                    <FormControl>
                      <select 
                        {...field}
                        className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]" 
                      >
                        <option value="SD 240p">SD 240p</option>
                        <option value="SD 360p">SD 360p</option>
                        <option value="SD 480p">SD 480p</option>
                        <option value="HD 720p">HD 720p</option>
                        <option value="HD 1080p">HD 1080p</option>
                        <option value="2K 1440p">2K 1440p</option>
                        <option value="4K 2160p">4K 2160p</option>
                        <option value="8K 4320p">8K 4320p</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-white">Movie Thumbnail</FormLabel>
                  <FormControl>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Image className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                          <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#E50914] hover:text-[#B81D24] focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              id="thumbnail-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={e => onChange(e.target.files || new DataTransfer().files)}
                              {...fieldProps}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        {value instanceof FileList && value.length > 0 && (
                          <p className="text-sm text-gray-300">{value[0].name}</p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="video"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-white">Movie File</FormLabel>
                  <FormControl>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Film className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                          <label htmlFor="movie-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#E50914] hover:text-[#B81D24] focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              id="movie-upload"
                              type="file"
                              accept="video/*"
                              className="sr-only"
                              onChange={e => onChange(e.target.files || new DataTransfer().files)}
                              {...fieldProps}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">MP4, MOV, AVI, MKV up to 2GB</p>
                        {value instanceof FileList && value.length > 0 && (
                          <p className="text-sm text-gray-300">{value[0].name}</p>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={uploadMovie.isPending}
                className="bg-[#E50914] hover:bg-[#B81D24]"
              >
                {uploadMovie.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Movie
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
