import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/instrument-sans/latin-400.css';
import '@fontsource/instrument-sans/latin-500.css';
import '@fontsource/instrument-sans/latin-600.css';
import '@fontsource/instrument-sans/latin-700.css';
import './index.css';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { prefetchData, queryClient } from './api/queryClient';

prefetchData();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
