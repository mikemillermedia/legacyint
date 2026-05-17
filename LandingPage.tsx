import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';

// 1. UPDATE YOUR BRANDS HERE:
const BRANDS = [
  "She Bears Fruit Podcast", 
  "15:5 Collective", 
  "The Breakdown With Jasmine Martines", 
  "Giving While Black Podcast", 
];

// --- LUXURY ANIMATION VARIANTS ---
// This controls the staggered "orchestra" effect of elements loading in
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Delay between each element loading
      delayChildren: 0.4,    // Initial wait time before the text starts
    },
  },
};

// This controls the actual cinematic blur-and-slide effect for each item
const itemVariants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // --- NATIVE SEO LOGIC ---
    document.title = "Rise & Render | Premium Video Podcasting Studio DFW";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "Dallas/Fort Worth's premier video podcasting studio. Rise in your purpose. Render your calling. Book your studio session or join our exclusive creator community today.";
    
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionText);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", descriptionText);
      document.head.appendChild(metaDescription);
    }
    // ------------------------

  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black text-[#F5F5F0] font-sans flex flex-col">
      <CustomCursor />

      {/* 1. CINEMATIC VIDEO BACKGROUND WITH FADE & SCALE REVEAL */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="fixed inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/studio-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* 2. TOP NAVBAR (Fades in gently) */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-full z-50 p-6 md:p-12"
      >
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-10 md:h-16 w-auto" />
        </div>
      </motion.nav>

      {/* 3. CENTERED CONTENT PORTAL */}
      <main className="relative z-20 flex-grow flex flex-col items-center justify-start px-6 text-center">
        
        {/* Responsive Spacer to push content down perfectly */}
        <div className="h-32 md:h-64 flex-shrink-0" />

        {/* The orchestrator for the staggered animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl w-full flex flex-col items-center"
        >
          {/* TITLE */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black mb-4 md:mb-6 leading-[0.9] tracking-tighter uppercase"
          >
            Premium Video <br /> Podcasting Studio
          </motion.h1>
          
          {/* SUBTITLE */}
          <motion.h2 
            variants={itemVariants}
            className="text-lg sm:text-2xl md:text-4xl font-bold mb-12 md:mb-16 tracking-tight"
          >
            <span className="text-[#ff4d00]">Rise In Your Purpose. Render Your Calling.</span>
          </motion.h2>

          {/* BUTTONS */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full mb-16"
          >
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Studio Pricing
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Community Hub
            </button>
          </motion.div>

          {/* INFINITE BRAND TICKER */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-2xl mx-auto flex flex-col items-center opacity-80 mb-20 md:mb-32"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-6">
              Trusted by creators from
            </p>
            <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <motion.div
                className="flex whitespace-nowrap items-center gap-12 sm:gap-20"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Infinity,
                  ease: "linear",
                  duration: 12, 
                }}
              >
                {[...BRANDS, ...BRANDS].map((brand, index) => (
                  <span 
                    key={index} 
                    className="text-white/50 font-black uppercase tracking-widest text-sm md:text-base"
                  >
                    {brand}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* SPOTLIGHT GOOGLE REVIEW */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-4xl mx-auto mb-32 relative group"
          >
            {/* Ambient orange glow behind the review */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/20 via-transparent to-transparent rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
            
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-14 rounded-[2.5rem] text-left shadow-2xl overflow-hidden cursor-default transition-all duration-500 hover:border-white/20">
              {/* Decorative top-right accent */}
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#ff4d00]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={22} className="text-[#ff4d00] fill-[#ff4d00]" />
                    ))}
                  </div>
                  
                  {/* MAIN QUOTE HOOK */}
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug md:leading-tight mb-4">
                    "10/10 recommended! I loved working with this studio. Not only was it <span className="text-[#ff4d00]">easy to just show up and record</span> for the day, but the space was very clean, tidy and stunning in person. The <span className="text-[#ff4d00]">video quality is top tier</span>, and you can tell everything is being done professionally."
                  </h3>
                  
                  {/* DETAILED PRAISE */}
                  <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                    "I loved that they have a bathroom in the space so you don't have to go far if you need it, and there's a place to hang and steam your clothes if you're doing outfit changes. I definitely recommend working with this company!"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {/* Placeholder Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center overflow-hidden">
                      <span className="text-white/50 font-bold">C</span>
                    </div>
                    <div>
                      {/* CLIENT NAME */}
                      <p className="text-white font-black uppercase tracking-widest text-sm">Candace J</p>
                      <div className="flex items-center gap-2 mt-1">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-3.5 h-3.5" />
                        <p className="text-white/50 text-xs font-medium">Verified Google Review</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle CTA next to the review to drive clicks */}
                <div className="hidden lg:flex flex-col items-center justify-center p-8 border-l border-white/10 ml-4 pl-12 shrink-0">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Ready to level up?</p>
                  <button 
                    onClick={() => navigate('/pricing')}
                    className="bg-transparent hover:bg-white text-white hover:text-black border border-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>

      {/* 4. MINIMALIST FOOTER (Fades in last) */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        className="relative z-50 w-full p-6 md:p-12 pb-8 mt-auto"
      >
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50">
          <a href="https://instagram.com/riseandrenderdfw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://share.google/IgqCwzByhKTVbgUZL" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">DFW Location</a>
          <a href="mailto:booking@riseandrenderdfw.com" className="hover:text-white transition-colors">Contact</a>
          
          <div className="hidden md:block w-px h-4 bg-white/20"></div>
          
          <a href="https://mikemillermedia.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Designed by Mike Miller Media</a>
        </div>
        <p className="text-[9px] md:text-[10px] text-center mt-6 text-white/30 uppercase tracking-widest">
          ©2026 Rise + Render. All Rights Reserved.
        </p>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
