import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Navbar from './components/Navbar';
import "bootstrap/dist/css/bootstrap.min.css"
import { AuthContextProvider } from './context/AuthContext.js';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <Navbar />
        <App />
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

