import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import BuilderApp from './pages/BuilderApp.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<BuilderApp />} />
        <Route path="/builder" element={<BuilderApp />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);
