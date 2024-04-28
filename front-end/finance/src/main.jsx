import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Root from './components/Root'
import Quote from './components/Quote'
import Trade from './components/Trade'
import Portfolio from './components/Portfolio';

// Configure root route
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/quote',
        element: <Quote />,
      },
      {
        path: '/trade',
        element: <Trade />,
      },
      {
        path: '/portfolio',
        element: <Portfolio />,
      }
    ],
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
