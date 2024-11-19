import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GiftPage from './GiftPage.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GiftPage />
  </StrictMode>,
)
