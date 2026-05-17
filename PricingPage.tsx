/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, TrendingUp, Video, Scissors, Share2, Palette, Clock, Calculator, ArrowRight, PlayCircle, Image as ImageIcon, Plus, Minus, FileText, Headphones, Monitor, Radio, Camera, Crown 
} from 'lucide-react';
import FluidBackground from './components/FluidBackground';
import CustomCursor from './components/CustomCursor';
import BrandLogo from './components/BrandLogo';

// Animation variants for section entrances
const sectionVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1], // Custom Apple-style ease-out curve
      staggerChildren: 0.1 
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  // CALCULATOR STATE
  const [selectedBase, setSelectedBase] = useState<'power_hour' | 'batch_day'>('power_hour');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [clipQuantity, setClipQuantity] = useState<number>(1);

  // PROMO CODE STATE
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);

    // --- NATIVE SEO LOGIC ---
    document.title = "Rise & Render | Studio Pricing & Packages";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "Build your custom podcast studio package. From a la carte studio time to full-service Signature Partnerships, get an instant estimate for your content needs.";
    
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionText);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", descriptionText);
      document.head.appendChild(metaDescription);
    }
    // ------------------------

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
    if (id === 'social_clip' && selectedAddons.includes('social_clip')) {
      setClipQuantity(1);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'fruit15') {
      setPromoApplied(true);
      if (selectedBase === 'power_hour') {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      } else {
        setPromoMessage('Success! $200 Off applied.');
      }
    } else {
      setPromoApplied(false);
      setPromoMessage('Invalid discount code.');
    }
  };

  useEffect(() => {
    if (promoApplied) {
      if (selectedBase === 'power_hour') {
        setPromoMessage('Success! Buy 1 Get 1 Free Hour applied.');
      } else {
        setPromoMessage('Success! $200 Off applied.');
      }
    }
  }, [selectedBase, promoApplied]);

  // PRICING DATA
  const basePackages = {
    power_hour: {
      id: 'power_hour',
      name: 'The Power Hour',
      price: 250,
      time: '1 Hour',
      description: 'Perfect for a single high-impact episode.',
      features: [
        '1 Hour Recording Time',
        '30-min Arrival/Departure Buffer',
        '4K Video & Pro Lighting',
        'Engineered Audio (2 Mics)'
      ]
    },
    batch_day: {
      id: 'batch_day',
      name: 'The Batch Day',
      price: 800,
      time: '4 Hours',
      description: 'Record a month of content in one sitting.',
      features: [
        '4 Hours Recording Time',
        '30-min Arrival/Departure Buffer',
        'Multiple Wardrobe Changes',
        'High-Volume Efficiency'
      ]
    }
  };

  const addonOptions = [
    { id: 'basic_edit', name: 'Basic Editing', desc: 'Simple multi-cam cuts and color grade.', price: 150, type: 'per_episode', icon: <Scissors size={20} /> },
    { id: 'advanced_edit', name: 'Advanced Editing', desc: 'Engaging hooks & flow optimized for retention.', price: 250, type: 'per_episode', icon: <PlayCircle size={20} /> },
    { id: 'thumbnail', name: 'Custom YouTube Thumbnail', desc: 'High-CTR custom graphic design.', price: 75, type: 'per_episode', icon: <ImageIcon size={20} /> },
    { id: 'social_clip', name: 'Social Media Clip', desc: 'Vertical reels optimized for IG/TikTok.', price: 100, type: 'per_clip', icon: <Share2 size={20} /> },
    { id: 'seo_notes', name: 'SEO Show Notes', desc: 'YouTube description, summary & timestamps.', price: 50, type: 'per_episode', icon: <FileText size={20} /> },
    { id: 'audio_dist', name: 'Audio Distribution', desc: 'Master & upload to Spotify/Apple Podcasts.', price: 50, type: 'per_episode', icon: <Headphones size={20} /> },
    { id: 'teleprompter', name: 'Teleprompter Setup', desc: 'Send script in advance, we run the prompter.', price: 50, type: 'per_session', icon: <Monitor size={20} /> },
    { id: 'live_stream', name: 'Live Simulcast', desc: 'Broadcast live to YouTube/Facebook.', price: 150, type: 'per_session', icon: <Radio size={20} /> },
    { id: 'bts_broll', name: 'Behind-The-Scenes B-Roll', desc: 'Raw, cinematic vertical footage for organic social.', price: 75, type: 'per_session', icon: <Camera size={20} /> },
  ];

  const isPowerHourPromo = promoApplied && selectedBase === 'power_hour';
  const isBatchDayPromo = promoApplied && selectedBase === 'batch_day';
  const episodeMultiplier = selectedBase === 'batch_day' ? 4 : (isPowerHourPromo ? 2 : 1);

  const calculateTotal = () => {
    let total = basePackages[selectedBase].price;
    if (isBatchDayPromo) total -= 200;
    selectedAddons.forEach(id => {
      const addon = addonOptions.find(a => a.id === id);
      if (addon) {
        if (addon.type === 'per_clip') {
          total += (addon.price * clipQuantity * episodeMultiplier);
        } else if (addon.type === 'per_episode') {
          total += (addon.price * episodeMultiplier);
        } else if (addon.type === 'per_session') {
          total += addon.price; 
        }
      }
    });
    return total;
  };

  const generateCalculatorUrl = () => {
    const baseUrl = "https://form.jotform.com/261096943415057";
    let pkgName = basePackages[selectedBase].name;
    if (isPowerHourPromo) pkgName += ' (BOGO PROMO CLAIMED)';
    else if (isBatchDayPromo) pkgName += ' (PROMO CLAIMED - $200 Off)';
    const finalPkgName = encodeURIComponent(pkgName);
    const addonsList = encodeURIComponent(selectedAddons.map(id => {
      if (id === 'social_clip') return `Social Clips (x${clipQuantity} per ep)`;
      return addonOptions.find(a => a.id === id)?.name || id;
    }).join(', ') || 'None');
    const total = calculateTotal();
    return `${baseUrl}?package=${finalPkgName}&addons=${addonsList}&total=${total}`;
  };

  const getSignatureUrl = (packageName: string) => {
    return `https://form.jotform.com/261096943415057?package=${encodeURIComponent(packageName + ' Retainer')}&addons=All%20Inclusive&total=Custom`;
  };

  // --- NEW: TRACKING FUNCTION FOR SIGN UPS ---
  const handleSubscribeClick = (tierName: string) => {
    // 1. Tell Google Analytics someone clicked Subscribe
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'generate_lead', {
        event_category: 'subscription',
        event_label: tierName,
      });
    }

    // 2. Tell Facebook someone clicked Subscribe
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', { content_name: tierName });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#F5F5F0] overflow-x-hidden">
      <CustomCursor />
      
      {/* NEW SUBTLE MONOCHROMATIC DEPTH BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#131313]" />
        
        {/* Subtle animated grey movements for depth */}
        <motion.div
          animate={{
            x: [0, 80, 0, -80, 0],
            y: [0, -80, 0, 80, 0],
          }}
          transition={{
            duration: 90, // very slow
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] mix-blend-screen"
        >
          <div className="absolute top-[10%] left-[10%] w-[80%] h-[80%] bg-[#F5F5F0]/3 rounded-full filter blur-[180px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[80%] h-[80%] bg-[#F5F5F0]/2 rounded-full filter blur-[180px]" />
        </motion.div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#131313] mix-blend-multiply opacity-90" />
      </div>

      <FluidBackground />

      {/* NAVBAR */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/70 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex justify-between items-center"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <BrandLogo className="h-14 md:h-16 w-auto" />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#F5F5F0]/80">
          <motion.button whileHover={{ y: -1, color: '#F5F5F0' }} onClick={() => navigate('/')} className="hover:text-[#ff4d00] transition-colors">Back to Home</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all border border-white/10">Hub Login</motion.button>
        </nav>
      </motion.div>

      {/* HERO SECTION with PARALLAX EFFECT */}
      <section ref={heroRef} className="pt-48 pb-24 px-6 md:px-12 max-w-5xl mx-auto text-center relative z-10 overflow-hidden">
        <motion.div style={{ y: yHeroText }}>
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-8xl font-black mb-8 leading-[0.92] tracking-tighter uppercase"
          >
            A Platform <br /> Built to <span className="text-[#ff4d00]">Scale.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl md:text-3xl text-[#F5F5F0]/90 mb-8 font-medium max-w-3xl mx-auto leading-tight"
          >
            We don’t just record podcasts. We help you clarify your message, create high-impact content, and build real authority.
          </motion.p>

          {/* NEW BUTTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full"
          >
            <button
              onClick={() => document.getElementById('partnerships')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-64 bg-[#ff4d00] hover:bg-orange-500 text-black py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105 shadow-[0_10px_30px_rgba(255,77,0,0.3)]"
            >
              Book Studio
            </button>
            <button
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-64 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-4 md:py-5 rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm transition-all hover:scale-105"
            >
              Pricing Breakdown
            </button>
          </motion.div>

        </motion.div>
      </section>

      {/* THE RISE PODCAST SYSTEM */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-24 bg-[#0a0a0a]/50 backdrop-blur-xl border-y border-white/5 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4">The Rise Podcast System™</h2>
            <p className="text-[#F5F5F0]/60 max-w-xl mx-auto">Our 5-pillar framework for total content dominance.</p>
          </div>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{ icon: TrendingUp, title: "1. Strategy", lines: ["• Podcast positioning", "• Episode structure", "• Content calendar", "• Growth roadmap"] },
              { icon: Video, title: "2. Production", lines: ["• 4K multi-camera recording", "• Professional lighting", "• Studio audio engineering", "• On-site support"] },
              { icon: Scissors, title: "3. Post-Production", lines: ["• Full episode edit", "• Hook optimization", "• Audio mastering", "• Visual captions"] },
              { icon: Share2, title: "4. Distribution Engine", lines: ["• 5–20 vertical clips", "• Platform-optimized", "• Hook-driven editing", "• YT Thumbnails"] },
              { icon: Palette, title: "5. Branding & Growth", lines: ["• Podcast cover art", "• YouTube setup", "• Design system", "• Templates", "• Landing pages"], colspan: 2 },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, borderColor: 'rgba(255, 77, 0, 0.3)' }} 
                className={`bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 hover:bg-[#131313]/60 transition-all duration-300 ${item.colspan ? `lg:col-span-${item.colspan} flex flex-col md:flex-row items-start md:items-center gap-8` : ''}`}
              >
                <div>
                  <item.icon className="w-10 h-10 text-[#ff4d00] mb-6" />
                  <h3 className="text-xl font-bold text-white mb-3 uppercase">{item.title}</h3>
                  <ul className={`space-y-2 text-sm text-[#F5F5F0]/70 ${item.colspan ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-8' : ''}`}>
                    {item.lines.map((line, lidx) => <li key={lidx}>{line}</li>)}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* SIGNATURE RETAINER PACKAGES */}
      <motion.section
        id="partnerships"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Signature <span className="text-[#ff4d00]">Partnerships</span></h2>
          <p className="text-xl text-[#F5F5F0]/80 max-w-2xl mx-auto leading-relaxed">
            For creators and business owners who want us to handle everything. Pricing starts at $1,500/month.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* I. The Ascent */}
          <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="bg-[#131313]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col hover:border-[#ff4d00]/30 transition-all shadow-xl">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">I. The Ascent</h3>
            <p className="text-4xl font-black text-[#ff4d00] mb-6">$1,500<span className="text-sm text-white/40 font-medium">/mo</span></p>
            <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Up to 3 hours of studio time</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 2 Long-form 4K Videos + Mastered Audio</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 4 Social Media Vertical Clips</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Custom YouTube Thumbnails</li>
            </ul>
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={getSignatureUrl("The Ascent")} target="_blank" rel="noopener noreferrer"
              onClick={() => handleSubscribeClick("The Ascent")}
              className="w-full block text-center bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border border-white/10"
            >
              Apply Now
            </motion.a>
          </motion.div>

          {/* II. The Summit */}
          <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="bg-[#0a0a0a]/90 backdrop-blur-xl p-8 rounded-3xl border border-[#ff4d00]/50 flex flex-col transition-all shadow-[0_0_40px_rgba(255,77,0,0.2)] relative transform lg:-translate-y-4">
            <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-xs font-black uppercase px-4 py-1.5 rounded-bl-xl">Most Popular</div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">II. The Summit</h3>
            <p className="text-4xl font-black text-[#ff4d00] mb-6">$3,000<span className="text-sm text-white/40 font-medium">/mo</span></p>
            <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Up to 5 hours of studio time</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 4 Long-form 4K Videos + Mastered Audio</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 12 Social Media Vertical Clips</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Custom YouTube Thumbnails</li>
            </ul>
            <motion.a 
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={getSignatureUrl("The Summit")} target="_blank" rel="noopener noreferrer"
              onClick={() => handleSubscribeClick("The Summit")}
              className="w-full block text-center bg-[#ff4d00] hover:bg-orange-500 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
            >
              Apply Now
            </motion.a>
          </motion.div>

          {/* III. The Horizon */}
          <motion.div variants={itemVariants} whileHover={{ y: -10 }} className="bg-[#131313]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col hover:border-[#ff4d00]/30 transition-all shadow-xl relative">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">III. The Horizon</h3>
              <Crown size={20} className="text-yellow-500" />
            </div>
            <p className="text-4xl font-black text-[#ff4d00] mb-6">$5,000<span className="text-sm text-white/40 font-medium">/mo</span></p>
            <ul className="space-y-4 text-sm text-[#F5F5F0]/80 mb-10 flex-grow">
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> Up to 8 hours (2 full batch days!)</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 8 Long-form 4K Videos + Mastered Audio</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 20 Social Media Vertical Clips</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> 8 Premium Custom Thumbnails</li>
              <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[#ff4d00] shrink-0 mt-0.5" /> In-Depth Content Strategy</li>
            </ul>
            <motion.a 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              href={getSignatureUrl("The Horizon")} target="_blank" rel="noopener noreferrer"
              onClick={() => handleSubscribeClick("The Horizon")}
              className="w-full block text-center bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 rounded-xl transition-colors border border-white/10"
            >
              Apply Now
            </motion.a>
          </motion.div>

        </div>
      </motion.section>

      {/* DIVIDER */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10"></div>
      </div>

      {/* INTERACTIVE PRICING CALCULATOR */}
      <motion.section
        id="calculator"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="py-12 px-6 md:px-12 max-w-6xl mx-auto relative z-10 mb-28"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20 text-[#ff4d00] text-sm font-bold uppercase tracking-widest mb-6">
            <Calculator size={16} /> A La Carte Studio Time
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">Build Your <span className="text-[#ff4d00]">Package</span></h2>
          <p className="text-xl text-[#F5F5F0]/70 max-w-2xl mx-auto leading-relaxed">
            Just need a single session? Select your studio time and creative add-ons below to generate a real-time estimate.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT COLUMN: SELECTIONS */}
          <motion.div variants={itemVariants} className="flex-1 space-y-12 w-full">
            
            {/* Step 1: Base Time */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-8 flex items-center gap-3">
                <span className="bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10">1</span> 
                Select Studio Time
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {(Object.keys(basePackages) as Array<keyof typeof basePackages>).map((key) => {
                  const pkg = basePackages[key as keyof typeof basePackages];
                  const isSelected = selectedBase === key;
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ y: -3, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedBase(key as 'power_hour' | 'batch_day')}
                      className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                        ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 shadow-[0_0_30px_rgba(255,77,0,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {key === 'batch_day' && !isBatchDayPromo && (
                        <div className="absolute top-0 right-0 bg-[#ff4d00] text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Save $200</div>
                      )}
                      {key === 'batch_day' && isBatchDayPromo && (
                        <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">-$200 APPLIED</div>
                      )}
                      {key === 'power_hour' && isPowerHourPromo && (
                        <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">+1 FREE HOUR</div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-xl font-black uppercase tracking-tight text-white`}>{pkg.name}</h4>
                        <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center mt-1 transition-colors ${isSelected ? 'border-[#ff4d00] bg-[#ff4d00]' : 'border-white/20'}`}>
                          {isSelected && <CheckCircle2 size={14} className="text-black" />}
                        </div>
                      </div>
                      <p className={`text-3xl font-black ${isSelected ? 'text-[#ff4d00]' : 'text-white'} mb-4`}>${pkg.price}</p>
                      <ul className={`space-y-2 text-sm text-[#F5F5F0]/70 flex-grow`}>
                        {pkg.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={16} className={`${isSelected ? 'text-[#ff4d00]' : 'text-white/60'} shrink-0 mt-0.5`} />
                            <span>{key === 'power_hour' && isPowerHourPromo && idx === 0 ? '2 Hours Recording Time (BOGO)' : feat}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Add-Ons */}
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-8 flex items-center gap-3">
                <span className="bg-white/5 w-8 h-8 rounded-full flex items-center justify-center text-sm border border-white/10">2</span> 
                Creative Add-Ons <span className="text-xs text-white/40 font-normal tracking-normal capitalize ml-2">(Optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {addonOptions.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <motion.div
                      key={addon.id}
                      whileHover={{ y: -3, borderColor: 'rgba(255, 255, 255, 0.2)' }}
                      whileTap={addon.id !== 'social_clip' || !isSelected ? { scale: 0.98 } : {}}
                      onClick={() => toggleAddon(addon.id)}
                      className={`cursor-pointer p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between ${
                        isSelected 
                        ? 'bg-[#ff4d00]/10 border-[#ff4d00]/50 shadow-[0_0_20px_rgba(255,77,0,0.1)]' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 w-full">
                        <div className="flex gap-4">
                          <div className={`p-2.5 rounded-xl shrink-0 mt-1 ${isSelected ? 'bg-[#ff4d00] text-black' : 'bg-white/5 text-white/80'}`}>
                            {addon.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white leading-tight mb-1">{addon.name}</h4>
                            <p className="text-xs text-white/60 leading-relaxed pr-2">{addon.desc}</p>
                            <p className={`text-sm font-black mt-2.5 ${isSelected ? 'text-[#ff4d00]' : 'text-white/80'}`}>
                              +${addon.price} 
                              <span className="text-xs font-normal">
                                {addon.type === 'per_clip' ? ' / clip' : addon.type === 'per_episode' ? ' / episode' : ' / session'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center mt-1.5 transition-colors ${isSelected ? 'border-[#ff4d00] bg-[#ff4d00]' : 'border-white/20'}`}>
                          {isSelected && <CheckCircle2 size={14} className="text-black" />}
                        </div>
                      </div>

                      {/* QUANTITY SELECTOR FOR SOCIAL CLIPS */}
                      <AnimatePresence>
                        {addon.id === 'social_clip' && isSelected && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-5 pt-5 border-t border-[#ff4d00]/20 flex items-center justify-between overflow-hidden"
                            onClick={(e) => e.stopPropagation()} 
                          >
                            <span className="text-xs font-bold text-[#ff4d00] uppercase tracking-wider">Clips per episode:</span>
                            <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-full p-1 border border-white/10">
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setClipQuantity(Math.max(1, clipQuantity - 1))} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Minus size={14} className="text-white" /></motion.button>
                              <span className="font-black text-white w-4 text-center">{clipQuantity}</span>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setClipQuantity(clipQuantity + 1)} className="w-7 h-7 rounded-full bg-[#ff4d00]/20 hover:bg-[#ff4d00]/40 flex items-center justify-center transition-colors"><Plus size={14} className="text-[#ff4d00]" /></motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </motion.div>

          {/* RIGHT COLUMN: THE RECEIPT / ESTIMATE (Sticky) */}
          <motion.div variants={itemVariants} className="lg:w-[420px] lg:sticky lg:top-32 w-full">
            <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-9 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#ff4d00]/10 via-transparent to-transparent pointer-events-none" />
              
              <h3 className="text-xl font-black uppercase tracking-widest text-white mb-7 border-b border-white/10 pb-5">Estimated Investment</h3>
              
              <div className="space-y-4 mb-7 min-h-[100px]">
                <div className="flex justify-between items-start text-white/90">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-snug">{basePackages[selectedBase].name}</span>
                    {isPowerHourPromo && <span className="text-green-400 text-[11px] font-bold mt-1.5 uppercase tracking-wider">+ 1 FREE Hour Applied</span>}
                  </div>
                  <span className="font-black text-lg mt-0.5">${basePackages[selectedBase].price}</span>
                </div>

                {isBatchDayPromo && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center text-green-400 text-sm overflow-hidden bg-green-950/40 px-3 py-2 rounded-lg border border-green-500/30">
                    <span className="font-bold">Promo: FRUIT15 (-$200)</span>
                    <span className="font-black">-$200</span>
                  </motion.div>
                )}
                
                <AnimatePresence>
                  {selectedAddons.map(id => {
                    const addon = addonOptions.find(a => a.id === id);
                    if (!addon) return null;
                    const qtyMultiplier = addon.id === 'social_clip' ? clipQuantity : 1;
                    const itemTotal = addon.price * episodeMultiplier * qtyMultiplier;

                    return (
                      <motion.div 
                        key={id} 
                        layout
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="flex justify-between items-center text-white/70 text-sm overflow-hidden"
                      >
                        <span className="py-1 flex items-center gap-1.5 flex-wrap">
                          + {addon.name} 
                          {addon.id === 'social_clip' && clipQuantity > 1 && <span className="text-white/40 text-[10px] uppercase tracking-wider">(x{clipQuantity})</span>}
                          {addon.type !== 'per_session' && episodeMultiplier > 1 && (
                            <span className="text-[#ff4d00] text-[10px] font-black bg-[#ff4d00]/10 px-1.5 py-0.5 rounded-md shrink-0">x{episodeMultiplier} eps</span>
                          )}
                        </span>
                        <span className="py-1 shrink-0 ml-3 font-bold text-white/90">${itemTotal}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* PROMO CODE SECTION */}
              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm w-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff4d00] transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyPromo}
                    className="bg-white hover:bg-white/90 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0"
                  >
                    Apply
                  </motion.button>
                </div>
                <AnimatePresence>
                  {promoMessage && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className={`text-xs mt-3.5 font-medium px-1 ${promoApplied && (selectedBase === 'power_hour' || selectedBase === 'batch_day') ? 'text-green-400' : 'text-[#ff4d00]'}`}
                    >
                      {promoMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-t border-white/10 pt-7 mt-5 mb-10">
                <div className="flex justify-between items-end">
                  <span className="text-white/60 uppercase tracking-widest text-xs font-bold">Estimated Total</span>
                  <span className="text-6xl font-black text-[#ff4d00] tracking-tighter">${calculateTotal()}</span>
                </div>
                <p className="text-[#F5F5F0]/50 text-xs italic mt-5 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  *This providing a preview estimate. Exact packaging will be solidified during consultation. No payment required today.
                </p>
              </div>

              {/* DYNAMIC JOTFORM LINK */}
              <motion.a 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={generateCalculatorUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSubscribeClick("Custom Calculator Package")}
                className="w-full flex items-center justify-center gap-3 bg-[#ff4d00] text-black px-6 py-4.5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-[0_10px_30px_rgba(255,77,0,0.3)] text-base relative z-10"
              >
                Submit Application <ArrowRight size={18} />
              </motion.a>
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 z-40 bg-white/10 hover:bg-[#ff4d00] text-white p-3 rounded-full transition-all shadow-xl backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
        </button>
      )}

    </div>
  );
};

export default PricingPage;


