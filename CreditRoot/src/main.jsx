import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PollarProvider } from '@pollar/react'
import { AppShell } from './app/AppShell'
import './i18n/index.js'
import './index.css'

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <BrowserRouter>
      <PollarProvider config={{ apiKey: import.meta.env.VITE_POLLAR_KEY }}>
        <AppShell />
      </PollarProvider>
    </BrowserRouter>
  </StrictMode>
)
