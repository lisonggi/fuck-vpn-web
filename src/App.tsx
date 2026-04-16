import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { SnackbarProvider } from 'notistack';
import { ModalProvider } from "./providers/ModalProvider";

const queryClient = new QueryClient()

function App() {
  return (
    <ModalProvider>
      <SnackbarProvider autoHideDuration={2000} anchorOrigin={{ horizontal: "center", vertical: "top" }} >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SnackbarProvider>
    </ModalProvider>
  )
}

export default App