import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import AppLayout from './Pages/layout/AppLayout.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx'
import Home from './Pages/Home.jsx';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import SeatSelect from './Pages/SeatSelect.jsx';
import UserDetails from './Pages/UserDetails.jsx';
import Final from './Pages/Final/Final.jsx';
import { BookingProvider } from './contexts/BookingContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/', element: <AppLayout />,
    children: [{
      path: '/', element: <Home />
    },
    { path: '/flight/:id', 
      element: 
      <PrivateRoute>
        <UserDetails /> 
      </PrivateRoute>
    },
    { path: '/flight/:id/seatselect', element: 
    <PrivateRoute><SeatSelect /></PrivateRoute>
     },
    ]
  },
  { path: '/payment', element: <PrivateRoute><Final /></PrivateRoute> },
  { path: '/Login', element: <Login /> },
  {path: '/Signup', element: <Signup /> }
]);

createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <BookingProvider>
        <RouterProvider router={router} />
      </BookingProvider>
    </AuthProvider>
  );
