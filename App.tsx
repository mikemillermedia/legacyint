import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Hub from './Hub';
import Login from './Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* This tells the app to load LandingPage on the main URL */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Your other routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/hub" element={<Hub />} />
      </Routes>
    </Router>
  );
}

export default App;
