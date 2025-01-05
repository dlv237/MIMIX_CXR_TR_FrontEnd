import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Routing from './Routing'
import AuthProvider from '../auth/AuthProvider'
import { Toaster } from 'react-hot-toast'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster toastOptions={{ duration: 2000 }} />
    <AuthProvider>
      <Routing />
    </AuthProvider>
  </React.StrictMode>
)
