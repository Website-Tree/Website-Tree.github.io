import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Update schema to validate for PNG, JPEG, and ICO file extensions
const profilePictureSchema = z.object({
  profilePicture: z.string()
    .url("Please enter a valid image URL")
    .refine(
      (url) => /\.(jpe?g|png|ico|gif|webp|svg)$/i.test(url),
      "URL must end with .png, .jpg, .jpeg, .ico, .gif, .webp, or .svg"
    ),
});

type ProfilePictureFormValues = z.infer<typeof profilePictureSchema>;

export default function ProfilePictureForm() {
  const { user, updateProfilePictureMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ProfilePictureFormValues>({
    resolver: zodResolver(profilePictureSchema),
    defaultValues: {
      profilePicture: user?.profilePicture || "",
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    // Check if URL is a valid image URL
    if (url && /^(https?:\/\/.*)\.(jpe?g|png|ico|gif|webp|svg)$/i.test(url)) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    form.setValue("profilePicture", "");
  };

  function onSubmit(values: ProfilePictureFormValues) {
    updateProfilePictureMutation.mutate(
      { 
        profilePicture: values.profilePicture,
      }, 
      {
        onSuccess: () => {
          setIsOpen(false);
          setPreviewUrl(null);
          toast({
            title: "Profile picture updated!",
            description: "Your new profile picture has been saved.",
          });
        },
      }
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 bg-background shadow-md hover:bg-secondary border-primary"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Enter a URL for your new profile picture. Supports .png, .jpg, .jpeg, .ico, .gif, .webp, or .svg formats.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="relative rounded-full overflow-hidden border-4 border-primary w-32 h-32">
                <img 
                  src={previewUrl || user?.profilePicture || ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://i.imgur.com/m0dmOrx.png"; // Fallback image
                  }}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://example.com/image.png" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          handleUrlChange(e);
                        }}
                      />
                      {field.value && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="absolute right-0 top-0 h-full px-3" 
                          onClick={clearPreview}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfilePictureMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {updateProfilePictureMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}