// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional
import "remixicon/fonts/remixicon.css";
import App from "./App.tsx";
import "./index.css";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Cache queries for 5 minutes
      retry: 2, // Retry failed queries twice
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      
    </QueryClientProvider>
  </StrictMode>
);