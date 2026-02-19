import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminApp from './admin/AdminApp.tsx';
import '../src/admin/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
       <BrowserRouter>
         <AdminApp />
      </BrowserRouter>
   </StrictMode>
);
