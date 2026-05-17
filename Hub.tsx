import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, HeartHandshake, MessageSquare, User, Menu, X, Download, Folder, Activity, Bell, HelpCircle, Mail, Briefcase, Share2 } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import PrayerWall from './components/PrayerWall';
import ProfileTab from './ProfileTab';
import CommunityChat from './CommunityChat';
import Members from './Members';
import DirectMessages from './components/DirectMessages'; 
import CollabBoard from './components/CollabBoard'; 
import freeKitImage from './The Content Creator Studio Kit.jpg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Hub() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'guide';
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // NOTIFICATION & INBOX STATES
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0); 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  
  const desktopNotifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // --- DYNAMIC NATIVE SEO LOGIC ---
  useEffect(() => {
    const tabTitles: { [key: string]: string } = {
      activity: 'Latest Activity',
      messages: 'Messages',
      collabs: 'Kingdom Collabs',
      prayer: 'Prayer Wall',
      chat: 'Community Chat',
      profile: 'My Profile',
      guide: 'App Guide',
      vault: 'The Vault'
    };

    const pageTitle = tabTitles[activeTab] || 'Community Hub';
    document.title = `${pageTitle} | Rise & Render`;

    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "The private ecosystem for faith-driven creators. Connect, collaborate, and master your craft within the Rise & Render community.";

    if (metaDescription) {
      metaDescription.setAttribute("content", descriptionText);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", descriptionText);
      document.head.appendChild(metaDescription);
    }
  }, [activeTab]);
  // --------------------------------

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('hasSeenHubTooltip');
    if (!hasSeenTooltip) {
      setTimeout(() => setShowWelcomeTooltip(true), 1000);
    }
  }, []);

  const dismissTooltip = () => {
    setShowWelcomeTooltip(false);
    localStorage.setItem('hasSeenHubTooltip', 'true'); 
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Rise & Render Community',
      text: 'Check out this private community for faith-driven creators!',
      url: window.location.origin,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (err) { console.log('Share canceled', err); }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
        if (data) setCurrentUserProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  // Fetch unread bell notifications AND unread messages
  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadCount(count || 0);
      };
      
      const fetchUnreadDMs = async () => {
        const { count } = await supabase
          .from('direct_messages') 
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        setUnreadMessageCount(count || 0);
      };

      fetchUnread();
      fetchUnreadDMs();
    }
  }, [user, showNotificationsMenu, activeTab]); 

  // Fetch full notifications list when the menu is opened
  useEffect(() => {
    if (showNotificationsMenu && user) {
      const fetchAndMarkRead = async () => {
        setLoadingNotifs(true);
        const { data } = await supabase
          .from('notifications')
          .select('*, actor:actor_id(first_name, last_name, avatar_url)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30); 
          
        if (data) setNotifications(data);
        setLoadingNotifs(false);

        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
          
        setUnreadCount(0); 
      };
      fetchAndMarkRead();
    }
  }, [showNotificationsMenu, user]);

  // Handle clicking outside the menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktop = desktopNotifRef.current?.contains(target);
      const inMobileBell = mobileNotifRef.current?.contains(target);
      const inMobileDropdown = mobileDropdownRef.current?.contains(target);

      if (!inDesktop && !inMobileBell && !inMobileDropdown) {
        setShowNotificationsMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleNotificationClick = async (notif: any) => {
    setShowNotificationsMenu(false);
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    await supabase.from('notifications').delete().eq('id', notif.id);

    if (notif.type === 'new_dm') setSearchParams({ tab: 'messages', userId: notif.actor_id });
    else if (notif.type === 'new_prayer') setSearchParams({ tab: 'prayer' });
    else if (notif.post_id) setSearchParams({ tab: 'chat', postId: notif.post_id });
    else if (notif.actor_id) setSearchParams({ tab: 'activity', viewUser: notif.actor_id });
  };

  if (!user) return <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex items-center justify-center">Loading Hub...</div>;

  const NavLinks = () => (
    <>
      <button onClick={() => { setActiveTab('activity'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'activity' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Activity size={20} /> Latest Activity
      </button>

      <button onClick={() => { setActiveTab('collabs'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'collabs' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Briefcase size={20} /> Kingdom Collabs
      </button>

      <button onClick={() => { setActiveTab('prayer'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'prayer' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <HeartHandshake size={20} /> Prayer Wall
      </button>
      
      <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'chat' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <MessageSquare size={20} /> Community Chat
      </button>
      
      <button onClick={() => { setActiveTab('vault'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors ${activeTab === 'vault' ? 'bg-[#ff4d00]/10 text-[#ff4d00]' : 'text-[#F5F5F0]/60 hover:text-white hover:bg-white/5'}`}>
        <Folder size={20} /> The Vault
      </button>

      <div className="mt-8 mb-2 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Support & Share</div>
      <button onClick={() => { setActiveTab('guide'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors text-sm ${activeTab === 'guide' ? 'bg-white/10 text-white' : 'text-[#F5F5F0]/40 hover:text-white hover:bg-white/5'}`}>
        <HelpCircle size={18} /> App Guide & FAQ
      </button>
      
      <button onClick={() => { handleShare(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-colors text-sm text-[#F5F5F0]/40 hover:text-white hover:bg-white/5">
        <Share2 size={18} /> Share The Community
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-[#131313] text-[#F5F5F0] flex flex-col md:flex-row relative">
      
      {/* MOBILE HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#131313] border-b border-white/10 relative z-50 md:hidden">
        <div className="flex items-center font-black uppercase tracking-wider text-[13px] sm:text-sm whitespace-nowrap overflow-hidden mr-2">
         <span className="text-white mr-1">Rise & Render</span> 
         <span className="text-[#ff4d00]">Community</span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button 
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              if (showWelcomeTooltip) dismissTooltip(); 
            }} 
            className={`text-white p-2 rounded-xl transition-all ${showWelcomeTooltip ? 'bg-[#ff4d00]/20 text-[#ff4d00] animate-pulse' : ''}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* THE WELCOME POP-UP */}
        <AnimatePresence>
          {showWelcomeTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-16 right-4 w-64 bg-[#ff4d00] p-5 rounded-2xl shadow-[0_10px_40px_rgba(255,77,0,0.4)] border border-orange-400/50 origin-top-right z-[90]"
            >
              <div className="absolute -top-3 right-5 text-[#ff4d00]">
                <svg width="20" height="12" viewBox="0 0 20 12" fill="currentColor">
                  <path d="M10 0L20 12H0L10 0Z" />
                </svg>
              </div>
              <h4 className="font-black text-white text-lg mb-2">Welcome to the Hub! 🎉</h4>
              <p className="text-white/90 text-sm mb-4 leading-relaxed font-medium">
                Tap this menu to update your profile, check the App Guide, and explore the community.
              </p>
              <button 
                onClick={dismissTooltip}
                className="w-full bg-[#131313] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-black transition-colors shadow-lg"
              >
                Got it!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 w-full bg-[#131313] border-b border-[#F5F5F0]/10 p-4 flex flex-col gap-2 z-40">
          <NavLinks />
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-4">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 border-r border-[#F5F5F0]/10 p-6 sticky top-0 h-screen overflow-y-auto z-40">
        <h2 className="font-black uppercase tracking-widest text-2xl mb-12 cursor-pointer" onClick={() => navigate('/')}>
          Rise & Render <span className="text-[#ff4d00]">Community</span>
        </h2>
        <div className="flex flex-col gap-2 flex-grow">
          <NavLinks />
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors mt-8">
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      <div className="flex-grow relative">
        
        {/* DESKTOP HEADER ICONS */}
        <div className="hidden md:flex absolute top-6 right-8 z-[100] items-center gap-4">
          <div className="relative" ref={desktopNotifRef}>
            <button 
              onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
              className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/80 hover:text-white transition-all shadow-lg"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#131313]" />
              )}
            </button>

            <AnimatePresence>
              {showNotificationsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-80 max-h-[70vh] overflow-y-auto bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 origin-top-right"
                >
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 p-3 pb-2 border-b border-white/5 mb-2">Notifications</h3>
                  {loadingNotifs ? (
                    <div className="p-4 text-center text-xs text-white/40">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-white/40">You're all caught up!</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {notif.actor?.avatar_url ? <img src={notif.actor.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-white/40" />}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm text-white/90 leading-snug">
                            <span className="font-bold text-white">{notif.actor?.first_name || 'Someone'}</span> 
                            {notif.type === 'new_follower' && ' followed you.'}
                            {notif.type === 'new_post' && ' published a post.'}
                            {notif.type === 'new_dm' && ' sent a message.'}
                            {notif.type === 'post_like' && ' liked your post.'}
                            {notif.type === 'post_share' && ' shared your post.'}
                            {notif.type === 'repost' && ' reposted your thread.'}
                            {notif.type === 'new_prayer' && ' posted a prayer request.'}
                            {notif.type === 'new_prayer_reaction' && ' reacted to your prayer request.'}
                            {notif.type === 'new_prayer_comment' && ' commented on your prayer request.'}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5">{new Date(notif.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setActiveTab('messages')}
            className={`relative p-2.5 rounded-full border hover:bg-white/10 transition-all shadow-lg ${activeTab === 'messages' ? 'border-[#ff4d00] bg-[#ff4d00]/10 text-[#ff4d00]' : 'border-white/10 bg-white/5 text-white/80 hover:text-white'}`}
          >
            <Mail size={20} />
            {unreadMessageCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#131313]">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shadow-lg ${activeTab === 'profile' ? 'border-[#ff4d00]' : 'border-transparent hover:border-white/50'}`}
          >
            {currentUserProfile?.avatar_url ? (
              <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center"><User size={20} className="text-white/60" /></div>
            )}
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full pt-10 md:pt-16 pb-28 md:pb-12">
          {activeTab === 'activity' && <Members setActiveTab={setActiveTab} />}
          {activeTab === 'messages' && <DirectMessages user={user} />}
          {activeTab === 'collabs' && <CollabBoard user={user} />}
          {activeTab === 'prayer' && <PrayerWall user={user} />}
          {activeTab === 'chat' && <CommunityChat user={user} />}
          {activeTab === 'profile' && <ProfileTab user={user} />}

          {activeTab === 'guide' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">App Guide & FAQ</h1>
              <p className="text-[#F5F5F0]/60 mb-8">Everything you need to know to navigate the community app.</p>
              
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-black text-[#ff4d00] mb-4">Welcome to the Community</h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    The Rise & Render Community is a dedicated space to help you master your craft and connect with like-minded believers. Update your profile with your setup, bio, and favorite Bible reading so others can get to know you!
                  </p>
                </div>

                <div className="bg-[#1A1A1A] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-black text-white mb-4">Navigating the Hub</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-[#ff4d00] mb-1">Direct Messages (Inbox)</h4>
                      <p className="text-white/70 text-sm leading-relaxed">Chat privately 1-on-1 with other members. You can start a conversation by visiting someone's profile and clicking the "Message" button.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#ff4d00] mb-1">Kingdom Collabs</h4>
                      <p className="text-white/70 text-sm leading-relaxed">Looking for a video editor, graphic designer, or podcast co-host? Post a collab request to hire or partner with other believers!</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#ff4d00] mb-1">Community Chat & The /verse Command</h4>
                      <p className="text-white/70 text-sm leading-relaxed">The main feed for tech advice and networking. Type <strong>@</strong> followed by a name to mention someone. <strong>Bonus:</strong> If you type <strong>/verse John 3:16</strong>, a button will appear that automatically fetches and formats that scripture directly into your post!</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#ff4d00] mb-1">Prayer Wall</h4>
                      <p className="text-white/70 text-sm leading-relaxed">A safe, private space to bear one another's burdens. Click 'Praying' to show support, or leave a threaded reply to offer encouragement.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#ff4d00]/10 to-transparent border border-[#ff4d00]/20 p-6 md:p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xl font-black text-white mb-4">Special Member Pricing</h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base mb-4">
                    As an official member of the Rise & Render community, you receive exclusive, discounted pricing on all services through <strong>Rise & Render</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
                    <li><strong>DFW In-Studio:</strong> Book high-end podcast and video sessions in our Duncanville studio.</li>
                    <li><strong>Mobile Studio:</strong> We dispatch our cameras, lighting, and audio gear directly to your home/office.</li>
                    <li><strong>Remote Consulting:</strong> Strategic 1-on-1 guidance to architect your perfect content engine, anywhere in the world.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vault' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">The Vault</h1>
              <p className="text-[#F5F5F0]/60 mb-8">Download your exclusive assets and templates.</p>
              <div className="bg-[#131313] border border-[#F5F5F0]/10 p-6 rounded-2xl max-w-sm hover:border-[#ff4d00]/50 transition-colors cursor-pointer group shadow-xl">
                <div className="w-full aspect-video bg-[#1a1a1a] rounded-xl mb-4 overflow-hidden relative">
                   <img src={freeKitImage} alt="The Content Creator Studio Kit" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-[#ff4d00] text-white p-3 rounded-full">
                         <Download size={24} />
                      </div>
                   </div>
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-[#ff4d00] transition-colors">The Content Creator Studio Kit</h3>
                <p className="text-sm text-white/40 mb-4">A complete PDF guide to our exact studio setup and gear recommendations.</p>
                
                <a href="/The Content Creator Studio Kit.pdf" download className="flex items-center gap-2 text-sm text-[#ff4d00] font-bold hover:underline">
                  <Download size={16} /> Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE NOTIFICATION DROPDOWN */}
      <AnimatePresence>
        {showNotificationsMenu && (
          <div className="md:hidden fixed inset-x-0 bottom-[90px] z-[110] flex justify-center px-4 pointer-events-none">
            <motion.div
              ref={mobileDropdownRef}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-[340px] max-h-[60vh] overflow-y-auto bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-2 origin-bottom pointer-events-auto"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 p-3 pb-2 border-b border-white/5 mb-2">Notifications</h3>
              {loadingNotifs ? (
                <div className="p-4 text-center text-xs text-white/40">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-white/40">You're all caught up!</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {notif.actor?.avatar_url ? <img src={notif.actor.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-white/40" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm text-white/90 leading-snug">
                        <span className="font-bold text-white">{notif.actor?.first_name || 'Someone'}</span> 
                        {notif.type === 'new_follower' && ' followed you.'}
                        {notif.type === 'new_post' && ' published a post.'}
                        {notif.type === 'new_dm' && ' sent a message.'}
                        {notif.type === 'post_like' && ' liked your post.'}
                        {notif.type === 'post_share' && ' shared your post.'}
                        {notif.type === 'repost' && ' reposted your thread.'}
                        {notif.type === 'new_prayer' && ' posted a prayer request.'}
                        {notif.type === 'new_prayer_reaction' && ' reacted to your prayer request.'}
                        {notif.type === 'new_prayer_comment' && ' commented on your prayer request.'}
                      </p>
                      <p className="text-[10px] text-white/40 mt-0.5">{new Date(notif.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100vw-40px)] max-w-[360px] bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 z-[100] px-6 py-2.5 rounded-full flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="relative" ref={mobileNotifRef}>
          <button 
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)} 
            className={`relative p-2 transition-all duration-300 ${showNotificationsMenu ? 'text-white scale-110' : 'text-white/40 hover:text-white/80'}`}
          >
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4d00] rounded-full border border-[#1a1a1a]" />}
          </button>
        </div>
        <button 
          onClick={() => { setActiveTab('chat'); setShowNotificationsMenu(false); }} 
          className={`p-2 transition-all duration-300 ${activeTab === 'chat' ? 'text-white scale-110' : 'text-white/40 hover:text-white/80'}`}
        >
          <MessageSquare size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => { setActiveTab('prayer'); setShowNotificationsMenu(false); }} 
          className={`p-2 transition-all duration-300 ${activeTab === 'prayer' ? 'text-white scale-110' : 'text-white/40 hover:text-white/80'}`}
        >
          <HeartHandshake size={20} strokeWidth={1.5} />
        </button>
        <button 
          onClick={() => { setActiveTab('messages'); setShowNotificationsMenu(false); }} 
          className={`relative p-2 transition-all duration-300 ${activeTab === 'messages' ? 'text-white scale-110' : 'text-white/40 hover:text-white/80'}`}
        >
          <Mail size={20} strokeWidth={1.5} />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-[#1a1a1a]">
              {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => { setActiveTab('profile'); setShowNotificationsMenu(false); }} 
          className={`w-7 h-7 rounded-full overflow-hidden border transition-all duration-300 ${activeTab === 'profile' ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
        >
          {currentUserProfile?.avatar_url ? (
            <img src={currentUserProfile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center"><User size={14} strokeWidth={1.5} className="text-white/80" /></div>
          )}
        </button>
      </div>
    </div>
  );
}
