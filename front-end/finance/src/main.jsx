import React from 'react'
import ReactDOM from 'react-dom/client'
// import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Root from './components/Root/Root'
import Quote from './components/Quote/Quote'
import Trade from './components/Trade/Trade'
import Portfolio from './components/Portfolio/Portfolio';

/* 
BrowserRouter apparently does not work for deplyoment on GH Pages, switching to HashRouter

// Configure root route
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true, // Make portfolio the default component 
        element: <Portfolio />,
      },
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
*/

const App = () => (
  <HashRouter>
    <Routes>
      <Route exact path='/' component={Root} />
      <Route path = '/quote' component={Quote} />
      <Route path = '/trade' component={Trade} />
      <Route path='/portfolio' component={Portfolio} />
    </Routes>
  </HashRouter>
);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
