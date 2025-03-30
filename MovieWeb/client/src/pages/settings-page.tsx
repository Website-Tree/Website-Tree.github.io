import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCircle, Home, Mail, AlertTriangle, CheckCircle, Shield, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { user, queryClient } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [sendingVerification, setSendingVerification] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account settings saved",
      description: "Your account information has been updated successfully.",
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Preferences saved",
      description: "Your streaming preferences have been updated.",
    });
  };
  
  const handleRequestVerification = async () => {
    if (!user.email) {
      toast({
        title: "Email Required",
        description: "You need to set an email address in your account details first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSendingVerification(true);
      
      const response = await apiRequest("POST", "/api/request-verification", { 
        userId: user.id,
        email: user.email
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to request verification");
      }
      
      toast({
        title: "Verification Ready",
        description: "Your account is ready for verification. Please use your verification code to verify your account.",
      });
      
      // Refresh the user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch (error) {
      let message = "An error occurred while requesting verification";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Verification Request Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto pt-20 px-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="flex items-center text-muted-foreground hover:text-foreground"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
            onClick={() => setLocation('/profile')}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="account" className="mb-10">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveAccount}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user.username} disabled />
                    <p className="text-sm text-muted-foreground">
                      Your username cannot be changed
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Enter your email address" />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Enter your display name" />
                    <p className="text-sm text-muted-foreground">
                      This is the name that will be displayed publicly
                    </p>
                  </div>

                  <Separator className="my-2" />
                  
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm"
                      placeholder="Tell others about yourself"
                    />
                    <p className="text-sm text-muted-foreground">
                      A short bio to display on your profile (max 160 characters)
                    </p>
                  </div>
                </div>
                
                <Button type="submit" className="mt-6">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Preferences</CardTitle>
              <CardDescription>
                Customize your streaming experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePreferences}>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoplay">Autoplay</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically play the next episode in a series
                      </p>
                    </div>
                    <Switch id="autoplay" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hd-streaming">HD Streaming</Label>
                      <p className="text-sm text-muted-foreground">
                        Always stream in the highest quality available
                      </p>
                    </div>
                    <Switch id="hd-streaming" defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="previews">Previews</Label>
                      <p className="text-sm text-muted-foreground">
                        Show previews while browsing
                      </p>
                    </div>
                    <Switch id="previews" />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="recommendations">Personalized Recommendations</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive content recommendations based on your viewing history
                      </p>
                    </div>
                    <Switch id="recommendations" defaultChecked />
                  </div>
                </div>
                
                <Button type="submit" className="mt-6">
                  Save Preferences
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters and include a number and special character
                  </p>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="login-notifications">Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when your account is accessed from a new device
                    </p>
                  </div>
                  <Switch id="login-notifications" defaultChecked />
                </div>
                
                {user.username === "Syfer-eng" && (
                  <>
                    <Separator className="my-4" />
                    
                    <div className="bg-primary/10 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {user.isVerified ? (
                            <CheckCircle className="text-green-500 h-6 w-6" />
                          ) : (
                            <AlertTriangle className="text-amber-500 h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            Account Verification
                            {user.isVerified && (
                              <Badge variant="outline" className="ml-2 text-green-500 border-green-500">
                                Verified
                              </Badge>
                            )}
                          </h3>
                          
                          {user.isVerified ? (
                            <p className="text-sm text-muted-foreground mt-1">
                              Your account has been verified. This provides additional security and access to advanced features.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground mt-1">
                                Verify your account to get additional security and access to advanced features.
                                You need the owner verification code to complete this process.
                              </p>
                              <Button 
                                onClick={handleRequestVerification}
                                disabled={sendingVerification || !user.email}
                                className="mt-3 bg-primary hover:bg-primary/90"
                                size="sm"
                              >
                                {sendingVerification ? "Processing..." : "Verify Account"}
                              </Button>
                              {!user.email && (
                                <p className="text-xs text-amber-500 mt-2">
                                  You need to add an email address in the Account tab first.
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <Button className="mt-6">
                Update Password
              </Button>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6 flex-col sm:flex-row gap-4">
              <div>
                <h4 className="font-semibold mb-1">Account Management</h4>
                <p className="text-sm text-muted-foreground">
                  Need to take a break from streaming?
                </p>
              </div>
              <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10">
                Deactivate Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}