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
import freeKitImage from './The Content Creator Studio Kit.jpg'; // Note: You may want to update this image asset later for the church

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
    document.title = `${pageTitle} | Legacy International`;

    let metaDescription = document.querySelector('meta[name="description"]');
    const descriptionText = "The online community hub for Legacy International. Connect, fellowship, collaborate, and grow together in faith.";

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
      title: 'Legacy International Community',
      text: 'Join our church community hub and connect with the Legacy International family!',
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
         <span className="text-white mr-1">Legacy International</span> 
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
          Legacy International <span className="text-[#ff4d00]">Community</span>
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
              {/* Rest of Guide Content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
