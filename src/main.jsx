import React from "react";
import { createRoot } from "react-dom/client"; // Updated import
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { worker } from "@uidotdev/react-query-api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CruiseB from "./CruiseFolder/CruiseB";



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:1000* 60
    }
  }
});

new Promise((res) => setTimeout(res, 100))
  .then(() =>
    worker.start({
      quiet: true,
      onUnhandledRequest: "bypass",
    }),
  )
  .then(() => {
    const root = createRoot(document.getElementById("root")); // Create a root
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <div className="container">
              <App/>
            </div>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </React.StrictMode>
    );
  });
