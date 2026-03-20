import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AcceslyProvider } from 'accesly'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AcceslyProvider
      appId={import.meta.env.VITE_ACCESLY_APP_ID}
      network="testnet"
    >
      <App />
    </AcceslyProvider>
  </StrictMode>,
)
