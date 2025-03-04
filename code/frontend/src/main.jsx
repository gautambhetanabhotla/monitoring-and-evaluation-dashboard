import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HeroUIProvider } from "@heroui/react";
import App from './App.jsx';
import './index.css';
import './vis_styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <main className="dark text-foreground bg-background">
          <App />
      </main>
    </HeroUIProvider>
  </StrictMode>
);
