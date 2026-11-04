import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/designTokens.css'
import './css/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
