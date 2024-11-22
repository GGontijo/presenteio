import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GiftRegistry from './GiftRegistry'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GiftRegistry />
  </StrictMode>,
)
