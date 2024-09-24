import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Index from './routes/Index.tsx';
import Welcome from './routes/Welcome.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    Component: Index
  },
  {
    path: "/welcome",
    Component: Welcome
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
