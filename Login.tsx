import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Folder, Briefcase, MessageSquare, HeartHandshake } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // THIS is the magic line. Changed from false to true so Sign Up loads first!
  const [isSignUp, setIsSignUp] = useState(true); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- NATIVE SEO LOGIC ---
  useEffect(() => {
    document.title = "Legacy International | Community Login";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "Sign in or create a free account to join the Legacy International Community where you can access sermon guides, submit prayer requests and chat with the community.";
    
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionText);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", descriptionText);
      document.head.appendChild(metaDescription);
    }
  }, []);
  // ------------------------

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate('/hub');
    };
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Success! Check your email to confirm your account, or simply sign in if confirmation is disabled.');
        setIsSignUp(false); // Flip to sign in screen after they register
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // THE MAGIC REDIRECT: Sends them directly to their profile with the onboarding tooltip activated!
        navigate('/hub?tab=profile&onboarding=true');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] flex items-center justify-center p-4 animate-in fade-in duration-500 font-sans">
      <div className="bg-[#1A1A1A] border border-white/5 p-8 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Subtle orange glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ff4d00] rounded-full mix-blend-screen filter blur-[100px] opacity-10" />

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">LEGACY <span className="text-[#ff4d00]">INTERNATIONAL</span></h1>
          <p className="text-[#ff4d00] font-bold text-xs tracking-widest mt-2 uppercase">Community Login</p>
          <p className="text-white/70 mt-4 text-sm leading-relaxed">
            {isSignUp ? "Create a free account to unlock your digital ecosystem. Connect, collaborate, and access premium tools built exclusively for faith-driven creators." : "Welcome back! Sign in to access the community."}
          </p>
        </div>

        {/* WHAT'S INSIDE SECTION - Only show on Sign Up */}
        {isSignUp && (
          <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 relative z-10 shadow-inner">
            <h3 className="text-white text-xs font-bold uppercase tracking-widest text-center mb-6">What's Inside?</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <Folder className="text-[#ff4d00] flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">The Vault:</strong> Instant access to exclusive media kits, graphic templates, and premium project files.</p>
              </div>
              <div className="flex gap-4 items-start">
                <Briefcase className="text-[#3b82f6] flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">Kingdom Collabs:</strong> Looking for an editor, designer, or co-host? Find and hire talented believers for your next project.</p>
              </div>
              <div className="flex gap-4 items-start">
                <MessageSquare className="text-white/40 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">Community Chat:</strong> The main feed for tech advice, networking, and direct messaging with other creators.</p>
              </div>
              <div className="flex gap-4 items-start">
                <HeartHandshake className="text-[#7c3aed] flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-white/70 leading-relaxed"><strong className="text-white">Prayer Wall:</strong> A dedicated, private space to support each other and bear one another's burdens.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6 text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#E8F0FE] text-black px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00] transition-shadow"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#E8F0FE] text-black px-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00] transition-shadow"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ff4d00] hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-xl transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg tracking-wide"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Free Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button 
            onClick={() => setIsSignUp(!isSignUp)} 
            className="text-white/40 hover:text-white transition-colors text-sm font-medium"
          >
            {isSignUp ? "Already have an account? Sign in here" : "Need an account? Create one here"}
          </button>
        </div>
      </div>
    </div>
  );
}
