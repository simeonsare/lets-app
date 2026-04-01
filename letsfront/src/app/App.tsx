import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />

      {/* Sonner toast provider */}
      <Toaster richColors position="top-right" />
    </>
  );
}
