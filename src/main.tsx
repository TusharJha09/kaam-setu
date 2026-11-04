import "@/lib/logger";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { LangProvider } from "@/lib/lang"
import { Toaster } from "@/components/ui/sonner"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <LangProvider>
          <App />
          <Toaster position="top-center" toastOptions={{ style: { borderRadius: "3px" } }} />
        </LangProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
