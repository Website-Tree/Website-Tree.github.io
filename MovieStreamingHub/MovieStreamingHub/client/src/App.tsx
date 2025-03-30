import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MyLibrary from "@/pages/my-library";
import Explore from "@/pages/explore";
import MovieDetails from "@/pages/movie-details";
import Embed from "@/pages/embed";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { UIProvider } from "@/contexts/ui-context";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-[#E5E5E5]">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/my-library" component={MyLibrary} />
          <Route path="/explore" component={Explore} />
          <Route path="/movies/:id" component={MovieDetails} />
          <Route path="/embed/:id" component={Embed} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <Router />
        <Toaster />
      </UIProvider>
    </QueryClientProvider>
  );
}

export default App;
