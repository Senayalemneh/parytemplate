import { Container } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import LanguageProvider from "./context/language-provider";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function App() {
  const queryClient = new QueryClient();
  return (
    <Container fluid className="w-full p-0">
      <Notifications />
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={routes()} />
        </QueryClientProvider>
      </LanguageProvider>
    </Container>
  );
}

export default App;
