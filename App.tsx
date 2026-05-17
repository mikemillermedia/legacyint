import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Hub from './Hub';
import PricingPage from './PricingPage';
import CookieConsent from './CookieConsent';
import { loadAnalytics } from './analytics';

export default function App() {
  
  // Check for returning users on initial load
  useEffect(() => {
    const userConsent = localStorage.getItem('user_cookie_consent');
    if (userConsent === 'accepted_all') {
      loadAnalytics();
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/hub" element={<Hub />} />
        </Routes>
      </BrowserRouter>
      
      {/* Global Cookie Consent Popup */}
      <CookieConsent />
    </>
  );
}
