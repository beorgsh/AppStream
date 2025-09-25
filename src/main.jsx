import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import HomeLayout from "./assets/Layouts/HomeLayout";
import Home from "./assets/Pages/Home";
import About from "./assets/Pages/About";
import Movies from "./assets/Pages/Movies";
import TV from "./assets/Pages/TV";
import Body from "./assets/Pages/Body";
import "./embla.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "movies",
        element: <Movies />,
      },
      {
        path: "tv",
        element: <TV />,
      },
      // Corrected route to match the link structure
      {
        path: "watch/:mediaType/:id",
        element: <Body />,
      },
      {
        path: "watch/:mediaType/:id/:seasonNumber/:episodeNumber",
        element: <Body />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
