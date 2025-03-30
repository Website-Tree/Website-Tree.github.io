import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { mockAuth, mockMovies } from "./mockStorage";
import { InsertUser } from "../shared/schema";

// For GitHub Pages deployment, we use mock data instead of API calls
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Mock API ${method} request to ${url}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock Response creator
  const createResponse = (ok: boolean, data: any, status = ok ? 200 : 400): Response => {
    return {
      ok,
      status,
      statusText: ok ? "OK" : "Error",
      json: async () => data,
      text: async () => JSON.stringify(data),
    } as unknown as Response;
  };
  
  // Handle authentication endpoints
  if (url === "/api/login" && method === "POST") {
    try {
      const user = await mockAuth.login(data as { username: string; password: string });
      return createResponse(true, user);
    } catch (error: any) {
      return createResponse(false, { message: error.message });
    }
  }
  
  if (url === "/api/register" && method === "POST") {
    try {
      const user = await mockAuth.register(data as InsertUser);
      return createResponse(true, user);
    } catch (error: any) {
      return createResponse(false, { message: error.message });
    }
  }
  
  if (url === "/api/logout" && method === "POST") {
    await mockAuth.logout();
    return createResponse(true, {});
  }
  
  if (url === "/api/user" && method === "GET") {
    const user = await mockAuth.getCurrentUser();
    if (!user) {
      return createResponse(false, { message: "Unauthorized" }, 401);
    }
    return createResponse(true, user);
  }
  
  // Handle movie endpoints
  if (url === "/api/movies" && method === "GET") {
    const movies = await mockMovies.getAllMovies();
    return createResponse(true, movies);
  }
  
  if (url.startsWith("/api/movies/category/") && method === "GET") {
    const category = url.split("/").pop();
    if (category) {
      const movies = await mockMovies.getMoviesByCategory(category);
      return createResponse(true, movies);
    }
  }
  
  if (url.startsWith("/api/movies/") && method === "GET") {
    const id = parseInt(url.split("/").pop() || "0");
    if (id) {
      const movie = await mockMovies.getMovie(id);
      if (movie) {
        return createResponse(true, movie);
      }
    }
  }
  
  if (url === "/api/movies/featured" && method === "GET") {
    const movies = await mockMovies.getFeaturedMovies();
    return createResponse(true, movies);
  }
  
  // Admin endpoints
  if (url === "/api/admin/users" && method === "GET") {
    try {
      const users = await mockAuth.getAllUsers();
      return createResponse(true, users);
    } catch (error: any) {
      return createResponse(false, { message: error.message }, 401);
    }
  }
  
  if (url.startsWith("/api/admin/users/") && method === "PATCH") {
    try {
      const id = parseInt(url.split("/").pop() || "0");
      const isLocked = (data as any)?.isLocked;
      
      if (id && typeof isLocked === "boolean") {
        const user = await mockAuth.updateUserLockStatus(id, isLocked);
        return createResponse(true, user);
      }
    } catch (error: any) {
      return createResponse(false, { message: error.message }, 401);
    }
  }
  
  // Default response for unhandled endpoints
  return createResponse(false, { message: "Endpoint not found" }, 404);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const res = await apiRequest("GET", url);
    
    if (unauthorizedBehavior === "returnNull" && (!res.ok && (res as any).status === 401)) {
      return null;
    }
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || (res as any).statusText);
    }
    
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});