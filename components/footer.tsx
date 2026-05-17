import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { Instagram, Youtube, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    // If we are on the landing page, scroll. If not, go to landing page first.
    if (window.location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) {
        window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <BrandLogo className="h-10 w-auto mb-6" />
          <p className="text-white/50 text-sm leading-relaxed">
            A community for Creatives Representing Christ. Rise in your purpose, render your calling.
          </p>
        </div>

        {/* Navigation Column */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Community</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><button onClick={() => navigate('/login')} className="hover:text-[#ff4d00] transition-colors">Join the Hub</button></li>
            <li><button onClick={() => scrollToSection('about')} className="hover:text-[#ff4d00] transition-colors">Why We Exist</button></li>
            <li><button onClick={() => scrollToSection('resources')} className="hover:text-[#ff4d00] transition-colors">Resources</button></li>
          </ul>
        </div>

        {/* Services Column */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Services</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><a href="https://tally.so/r/dWxaOy" target="_blank" rel="noreferrer" className="hover:text-[#ff4d00] transition-colors">Book DFW Studio</a></li>
            <li><button onClick={() => scrollToSection('dfw-studio')} className="hover:text-[#ff4d00] transition-colors">Strategy Sessions</button></li>
            <li><a href="https://mikemillermedia.com" target="_blank" rel="noreferrer" className="hover:text-[#ff4d00] transition-colors">Mike Miller Media</a></li>
          </ul>
        </div>

        {/* Social Column */}
        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Connect</h4>
          <div className="flex gap-4 mb-6">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d00] transition-all text-white"><Instagram size={18} /></a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d00] transition-all text-white"><Youtube size={18} /></a>
            <a href="mailto:contact@riseandrender.com" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#ff4d00] transition-all text-white"><Mail size={18} /></a>
          </div>
          <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest">Duncanville, TX</p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">
          © {new Date().getFullYear()} Rise & Render. All Rights Reserved.
        </p>
        <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-white/20">
          <button className="hover:text-white transition-colors">Privacy</button>
          <button className="hover:text-white transition-colors">Terms</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
