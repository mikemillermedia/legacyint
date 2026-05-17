import React, { useState, useEffect } from 'react';
import { loadAnalytics } from './analytics'; // Adjust the import path as needed

export default function CookieConsent() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const userConsent = localStorage.getItem('user_cookie_consent');
    if (!userConsent) {
      setShowPopup(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('user_cookie_consent', 'accepted_all');
    setShowPopup(false);
    
    // FIRE THE SCRIPTS IMMEDIATELY!
    loadAnalytics();
  };

  const handleRejectAll = () => {
    localStorage.setItem('user_cookie_consent', 'rejected_all');
    setShowPopup(false);
    // Do absolutely nothing here. The scripts remain blocked.
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[999] p-4 pointer-events-none flex justify-center">
      <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        <h3 className="text-xl font-black text-white mb-2 tracking-wider">
          Your Privacy Matters
        </h3>
        
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          We use cookies to improve your experience, analyze site traffic, and serve tailored content. 
          By clicking "Accept All", you agree to our use of cookies.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleRejectAll}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Reject Non-Essential
          </button>
          
          <button 
            onClick={handleAcceptAll}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#ff4d00] text-white text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-900/20"
          >
            Accept All
          </button>
        </div>

      </div>
    </div>
  );
}
