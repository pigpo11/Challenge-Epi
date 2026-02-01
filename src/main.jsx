import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FitnessProvider } from './hooks/useFitness'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FitnessProvider>
      <App />
    </FitnessProvider>
  </StrictMode>,
)
