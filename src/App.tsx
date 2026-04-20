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
    <QueryClientProvider client={queryClient} >
      <ModalProvider>
        <SnackbarProvider autoHideDuration={2000} anchorOrigin={{ horizontal: "center", vertical: "top" }} >
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ModalProvider>
    </QueryClientProvider>
  )
}

export default App