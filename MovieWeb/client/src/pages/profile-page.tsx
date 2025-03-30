import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserRound, Film, Calendar, Shield, CheckCircle, XCircle, Settings, ArrowLeft, Mail } from 'lucide-react';
import ProfilePictureForm from '@/components/profile/profile-picture-form';

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Function to format role for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Function to get avatar fallback from username
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Function to get color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-500 hover:bg-red-600';
      case 'member':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="container max-w-6xl mx-auto pt-20 px-4 pb-10">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-muted-foreground hover:text-foreground"
          onClick={() => setLocation('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center"
            onClick={() => setLocation('/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-primary">
                  <img 
                    src={user.profilePicture || ""} 
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://i.imgur.com/m0dmOrx.png"; // Fallback image
                    }}
                  />
                </div>
                <ProfilePictureForm />
              </div>
              
              <h2 className="text-2xl font-bold">{user.username}</h2>
              
              <div className="flex mt-2 space-x-2">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {formatRole(user.role)}
                </Badge>
                
                {user.isAdmin && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="w-full border-t mt-6 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <UserRound className="mr-2 h-4 w-4" />
                  <span>Account ID: {user.id}</span>
                </div>
                
                {user.email && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email: {user.email}</span>
                  </div>
                )}
                
                {user.username === "Syfer-eng" && (
                  <div className="flex items-center mt-2 text-sm">
                    {user.isVerified ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Account verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500">
                        <XCircle className="mr-2 h-4 w-4" />
                        <span>Pending verification</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Joined: March 2025</span>
                </div>
                
                {(user.role === 'owner' || user.role === 'member') && (
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Film className="mr-2 h-4 w-4" />
                    <span>Can upload content</span>
                  </div>
                )}
                
                {user.isAdmin && (
                  <div className="flex items-center mt-2 text-sm text-primary">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Full admin privileges</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div>
          <Tabs defaultValue="activity">
            <TabsList className="mb-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent streaming activity and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    <p>No recent activity to show.</p>
                    <p className="mt-2">Start watching movies to see your activity here!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="watchlist">
              <Card>
                <CardHeader>
                  <CardTitle>Your Watchlist</CardTitle>
                  <CardDescription>Movies and shows you want to watch later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    <p>Your watchlist is empty.</p>
                    <p className="mt-2">Add movies to your watchlist to see them here!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>Your Favorites</CardTitle>
                  <CardDescription>Movies and shows you've marked as favorites</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10 text-muted-foreground">
                    <p>You haven't added any favorites yet.</p>
                    <p className="mt-2">Mark movies as favorites to see them here!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}