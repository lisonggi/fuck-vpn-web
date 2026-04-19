import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from 'notistack';
import { RouterProvider } from "react-router";
import { ModalProvider } from "./providers/ModalProvider";
import { router } from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ModalProvider>
      <SnackbarProvider autoHideDuration={2000} anchorOrigin={{ horizontal: "center", vertical: "top" }} >
        <QueryClientProvider client={queryClient} >
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SnackbarProvider>
    </ModalProvider>
  )
}

export default App