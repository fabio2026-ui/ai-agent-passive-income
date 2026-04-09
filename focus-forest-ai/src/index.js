import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

import App from './App';
import Home from './pages/Home';
import Timer from './pages/Timer';
import Forest from './pages/Forest';
import Stats from './pages/Stats';
import Premium from './pages/Premium';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="timer" element={<Timer />} />
          <Route path="forest" element={<Forest />} />
          <Route path="stats" element={<Stats />} />
          <Route path="premium" element={<Premium />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
