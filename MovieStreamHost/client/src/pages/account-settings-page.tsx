import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { updateProfileSchema } from "@shared/schema";

// Change password form schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Profile form schema based on shared schema
const profileSchema = updateProfileSchema.extend({
  displayName: z.string().min(1, "Display name is required"),
});

// Type definitions
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile picture and account locking functionality removed

  // Password change form
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to change password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Account locking mutation removed

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || "",
    },
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Profile picture upload functionality removed
  
  // Form submission handlers
  const handleProfileSubmit = async (values: ProfileFormValues) => {
    // Only update profile info (no profile picture upload)
    updateProfileMutation.mutate(values);
  };

  const handlePasswordSubmit = (values: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="bg-[#1F1F1F] border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Profile Settings</CardTitle>
            <CardDescription>
              Update your display name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center space-y-4">
                <div>
                  <Avatar className="h-24 w-24">
                    {user?.profilePicture ? (
                      <AvatarImage 
                        src={`${user.profilePicture}?v=${Date.now()}`} 
                        alt={user.username}
                        onError={(e) => {
                          // If image fails to load, show fallback
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).style.display = 'none';
                          // Find and show the fallback
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            const fallback = parent.querySelector('[data-fallback]');
                            if (fallback) fallback.removeAttribute('hidden');
                          }
                        }}
                      />
                    ) : (
                      <AvatarFallback data-fallback className="bg-[#B81D24] text-white text-2xl">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                
                <div className="text-center text-sm text-gray-400 max-w-[200px]">
                  <p>Profile pictures are assigned based on your role and cannot be changed.</p>
                  <p className="mt-1 font-semibold text-gray-300">
                    Current role: {user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {/* Profile Info Form */}
              <div className="flex-1 w-full">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="How you want to be known" 
                              className="bg-[#141414] border-gray-700" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-[#E50914] hover:bg-[#B81D24] w-full"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Change Password Form */}
        <Card className="bg-[#1F1F1F] border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your current password" 
                          className="bg-[#141414] border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Your new password" 
                          className="bg-[#141414] border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your new password" 
                          className="bg-[#141414] border-gray-700" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="bg-[#E50914] hover:bg-[#B81D24] w-full"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Account locking settings removed */}
      </div>
    </div>
  );
}