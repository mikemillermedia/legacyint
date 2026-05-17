import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams, useLocation } from 'react-router-dom';
import { User, Camera, Link as LinkIcon, Instagram, Heart, MessageCircle, X, BookOpen, Plus, Trash2, Video } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export default function ProfileTab({ user }: { user: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const [showTooltip, setShowTooltip] = useState(location.state?.onboarding === true);

  const [profile, setProfile] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<any[]>([]); 
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]); 
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [bibleVerse, setBibleVerse] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [oneSignalId, setOneSignalId] = useState<string | null>(null); 

  // PORTFOLIO STATES
  const [showPortfolioUpload, setShowPortfolioUpload] = useState(false);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioPreview, setPortfolioPreview] = useState<string | null>(null);
  const [portfolioRatio, setPortfolioRatio] = useState<'16:9' | '9:16' | '4:5'>('16:9');
  const [portfolioCaption, setPortfolioCaption] = useState(''); 
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  
  // LIGHTBOX MODAL STATE
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserPosts();
      fetchPortfolio();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setBio(data.bio || '');
      setBibleVerse(data.bible_verse || '');
      setInstagramUrl(data.instagram_url || '');
      setWebsiteUrl(data.website_url || '');
      setAvatarPreview(data.avatar_url || null);
      setPushEnabled(data.push_notifications_enabled || false); 
      setOneSignalId(data.onesignal_id || null);
    }

    const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id);
    const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id);
    
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    setLoading(false);
  };

  const fetchUserPosts = async () => {
    const { data } = await supabase.from('posts').select('*, post_likes(user_id), comments(*)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setMyPosts(data);
  };

  const fetchPortfolio = async () => {
    const { data } = await supabase.from('portfolios').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setPortfolioItems(data);
  };

  const handlePushToggle = async () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    if (!pushEnabled) {
      window.OneSignalDeferred.push(async function(OneSignal: any) {
        await OneSignal.Slidedown.promptPush(); 
        setTimeout(async () => {
          const isOptedIn = OneSignal.User.PushSubscription.optedIn;
          if (isOptedIn) {
            const subId = OneSignal.User.PushSubscription.id;
            setPushEnabled(true);
            setOneSignalId(subId);
          } else {
            alert('Push permissions were denied or dismissed.');
            setPushEnabled(false);
          }
        }, 1500);
      });
    } else {
      window.OneSignalDeferred.push(async function(OneSignal: any) {
        await OneSignal.User.PushSubscription.optOut();
        setPushEnabled(false);
        setOneSignalId(null);
      });
    }
  };

  const formatUrl = (url: string) => {
    if (!url || !url.trim()) return '';
    return /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
  };

  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = profile?.avatar_url;

    if (avatarFile) {
      const fileName = `${user.id}/${Math.random()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        newAvatarUrl = publicUrl;
      }
    }

    const updates = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      bio,
      bible_verse: bibleVerse, 
      instagram_url: formatUrl(instagramUrl), 
      website_url: formatUrl(websiteUrl),     
      avatar_url: newAvatarUrl,
      push_notifications_enabled: pushEnabled, 
      onesignal_id: oneSignalId, 
      updated_at: new Date()
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    
    if (!error) {
      await fetchProfile();
      setIsEditing(false);
    } else {
      alert("Failed to save profile. Please ensure you are logged in correctly.");
    }
    setSaving(false);
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioFile) return;
    setUploadingPortfolio(true);

    try {
      const fileExt = portfolioFile.name.split('.').pop();
      const fileName = `portfolio/${user.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, portfolioFile);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
      
      await supabase.from('portfolios').insert([{
        user_id: user.id,
        media_url: publicUrl,
        aspect_ratio: portfolioRatio,
        caption: portfolioCaption.trim() || null 
      }]);

      setPortfolioFile(null);
      setPortfolioPreview(null);
      setPortfolioCaption('');
      setShowPortfolioUpload(false);
      fetchPortfolio();
    } catch (e: any) {
      alert("Error uploading portfolio: " + e.message);
    }
    setUploadingPortfolio(false);
  };

  const deletePortfolioItem = async (itemId: string) => {
    if (!window.confirm("Remove this from your portfolio?")) return;
    await supabase.from('portfolios').delete().eq('id', itemId);
    fetchPortfolio();
    if (selectedPortfolioItem?.id === itemId) setSelectedPortfolioItem(null);
  };

  const openFollowModal = async (type: 'followers' | 'following') => {
    setModalType(type);
    setShowFollowModal(true);
    setModalLoading(true);
    setModalUsers([]);

    if (type === 'followers') {
      const { data } = await supabase
        .from('follows')
        .select('follower:follower_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('following_id', user.id);
      if (data) setModalUsers(data.map((d: any) => d.follower).filter(Boolean));
    } else {
      const { data } = await supabase
        .from('follows')
        .select('following:following_id(id, first_name, last_name, avatar_url, instagram_url)')
        .eq('follower_id', user.id);
      if (data) setModalUsers(data.map((d: any) => d.following).filter(Boolean));
    }
    setModalLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading profile...</div>;

  const isVideo = (url: string | null) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

  const getRatioClass = (ratio: string) => {
    switch(ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:5': return 'aspect-[4/5]';
      default: return 'aspect-video';
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* APPLE-STYLE LIGHTBOX MODAL */}
      {selectedPortfolioItem && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl animate-in fade-in duration-300"
          onClick={() => setSelectedPortfolioItem(null)} 
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center rounded-[2rem] overflow-hidden shadow-2xl bg-[#1a1a1a]/40 border border-white/10"
            onClick={e => e.stopPropagation()} 
          >
            <button 
              onClick={() => setSelectedPortfolioItem(null)} 
              className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full text-white/70 hover:text-white backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden p-2 md:p-6">
              {isVideo(selectedPortfolioItem.media_url) ? (
                <video src={selectedPortfolioItem.media_url} controls autoPlay loop playsInline className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
              ) : (
                <img src={selectedPortfolioItem.media_url} className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-2xl" />
              )}
            </div>

            {selectedPortfolioItem.caption && (
              <div className="w-full p-6 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-md text-center border-t border-white/5 mt-auto">
                <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
                  {selectedPortfolioItem.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showFollowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#131313]/80 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
              <h3 className="text-white font-black uppercase tracking-widest text-sm">
                {modalType === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button onClick={() => setShowFollowModal(false)} className="text-white/40 hover:text-[#ff4d00] transition-colors p-1">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-2 space-y-1">
              {modalLoading ? (
                <div className="text-center text-white/40 text-sm py-8">Loading...</div>
              ) : modalUsers.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-8">No users found.</div>
              ) : (
                modalUsers.map((u, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                    onClick={() => { 
                      setShowFollowModal(false); 
                      setSearchParams({ tab: 'activity', viewUser: u.id }); 
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                      {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {u?.first_name || u?.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'CRC Member'}
                      </p>
                      {u?.instagram_url && <p className="text-xs text-[#ff4d00] truncate">@{u.instagram_url.split('.com/')[1]?.replace('/', '')}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-col mt-10">
          <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#ff4d00]/80 p-1 overflow-hidden shadow-[0_0_30px_rgba(255,77,0,0.15)] mb-4 bg-[#131313]">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center">
                  <User size={48} className="text-white/20" />
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{profile?.first_name} {profile?.last_name}</h1>
            
            {profile?.instagram_url && (
              <a 
                href={profile.instagram_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-white/50 hover:text-[#ff4d00] transition-colors mt-2 text-sm font-medium flex items-center gap-1.5"
              >
                <Instagram size={16} /> @{profile.instagram_url.split('.com/')[1]?.replace('/', '') || profile.instagram_url.replace(/^https?:\/\//, '')}
              </a>
            )}

            <div className="flex items-center gap-6 mt-4 text-sm text-white/60">
              <button onClick={() => openFollowModal('following')} className="hover:text-[#ff4d00] transition-colors flex flex-col items-center group">
                <span className="font-black text-white text-lg group-hover:text-[#ff4d00] transition-colors">{followingCount}</span> 
                <span className="text-xs uppercase tracking-widest">Following</span>
              </button>
              <div className="w-px h-8 bg-white/10"></div>
              <button onClick={() => openFollowModal('followers')} className="hover:text-[#ff4d00] transition-colors flex flex-col items-center group">
                <span className="font-black text-white text-lg group-hover:text-[#ff4d00] transition-colors">{followersCount}</span> 
                <span className="text-xs uppercase tracking-widest">Followers</span>
              </button>
            </div>

            <div className="relative mt-8">
              {showTooltip && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#ff4d00] text-black font-bold text-xs px-4 py-2 rounded-lg shadow-xl z-10 animate-bounce">
                  👋 Welcome! Let's set up your profile.
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#ff4d00] rotate-45" />
                </div>
              )}
              
              <button 
                onClick={() => {
                  setIsEditing(true);
                  setShowTooltip(false);
                }} 
                className={`bg-[#1A1A1A] hover:bg-white/10 text-white px-8 py-2.5 rounded-full font-semibold transition-all text-sm border border-white/5 shadow-lg ${showTooltip ? 'animate-pulse ring-2 ring-[#ff4d00]/50' : ''}`}
              >
                Edit Profile
              </button>
            </div>
            
          </div>

          <div className="w-full space-y-8">
            <div>
              <h3 className="text-white font-bold mb-2">Bio:</h3>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {profile?.bio || "No bio added yet. Click Edit Profile to add one!"}
              </p>
            </div>

            {profile?.bible_verse && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-[#ff4d00]" /> Favorite Verse / Current Reading
                </h3>
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap text-sm md:text-base italic border-l-2 border-[#ff4d00] pl-4 py-1 bg-white/5 rounded-r-lg">
                  "{profile.bible_verse}"
                </p>
              </div>
            )}

            {(profile?.website_url || profile?.instagram_url) && (
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white/40 font-bold uppercase tracking-widest text-xs mb-3">Links:</h3>
                <div className="flex flex-col gap-3">
                  {profile?.website_url && (
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm md:text-base font-medium"
                    >
                      <LinkIcon size={16} /> {profile.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* PORTFOLIO SECTION */}
            <div className="pt-8 border-t border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-bold">Portfolio</h3>
                  <p className="text-xs text-white/40 mt-1">Showcase your best work.</p>
                </div>
                <button 
                  onClick={() => {
                    setShowPortfolioUpload(!showPortfolioUpload);
                    setPortfolioFile(null);
                    setPortfolioPreview(null);
                    setPortfolioCaption('');
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-colors ${showPortfolioUpload ? 'bg-white/10 text-white' : 'bg-[#ff4d00]/10 text-[#ff4d00] hover:bg-[#ff4d00]/20'}`}
                >
                  {showPortfolioUpload ? 'Cancel' : <><Plus size={14} /> Add Work</>}
                </button>
              </div>

              {showPortfolioUpload && (
                <div className="mb-8 p-4 bg-[#1A1A1A] border border-white/5 rounded-2xl animate-in slide-in-from-top-2">
                  <div className="flex flex-col gap-4">
                    {!portfolioPreview ? (
                      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-[#ff4d00]/50 hover:bg-[#ff4d00]/5 transition-all cursor-pointer">
                        <Camera size={24} className="text-white/40 mb-2" />
                        <span className="text-sm text-white/60 font-medium">Select a Photo or Video</span>
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={e => {
                          if (e.target.files?.[0]) {
                            setPortfolioFile(e.target.files[0]);
                            setPortfolioPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden bg-black flex justify-center max-h-64 border border-white/10">
                        {portfolioFile?.type.startsWith('video/') ? (
                          <video src={portfolioPreview} controls loop playsInline className="max-h-64 w-auto" />
                        ) : (
                          <img src={portfolioPreview} className="max-h-64 w-auto object-contain" />
                        )}
                        <button onClick={() => {setPortfolioFile(null); setPortfolioPreview(null);}} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black"><X size={16}/></button>
                      </div>
                    )}

                    {portfolioFile && (
                      <div className="flex flex-col gap-3 mt-2">
                        <input 
                          value={portfolioCaption}
                          onChange={e => setPortfolioCaption(e.target.value)}
                          placeholder="Add a caption... (Optional)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]"
                        />
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                            {['16:9', '4:5', '9:16'].map(ratio => (
                              <button
                                key={ratio}
                                onClick={() => setPortfolioRatio(ratio as any)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${portfolioRatio === ratio ? 'bg-[#ff4d00] text-black' : 'text-white/40 hover:text-white'}`}
                              >
                                {ratio}
                              </button>
                            ))}
                          </div>
                          <button 
                            onClick={handlePortfolioUpload} 
                            disabled={uploadingPortfolio}
                            className="w-full sm:w-auto bg-white text-black font-bold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            {uploadingPortfolio ? 'Uploading...' : 'Upload to Portfolio'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {portfolioItems.length > 0 && (
                <div className="columns-3 gap-1 md:gap-2 space-y-1 md:space-y-2">
                  {portfolioItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedPortfolioItem(item)} 
                      className="relative group break-inside-avoid overflow-hidden rounded-md md:rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:border-white/30 transition-all"
                    >
                      <div className={`w-full ${getRatioClass(item.aspect_ratio)} relative`}>
                        {isVideo(item.media_url) ? (
                          <>
                            <video src={item.media_url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline onMouseEnter={e => (e.target as HTMLVideoElement).play()} onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                            <div className="absolute top-2 left-2 bg-black/60 p-1 rounded-md pointer-events-none">
                              <Video size={12} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <img src={item.media_url} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); 
                              deletePortfolioItem(item.id);
                            }}
                            className="bg-red-500/20 text-red-400 p-2.5 rounded-full hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {myPosts.length > 0 && (
              <div className="pt-8 border-t border-white/5">
                <h3 className="text-white font-bold mb-4">Your Recent Activity</h3>
                <div className="space-y-4">
                  {myPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => setSearchParams({ tab: 'chat', postId: post.id })}
                      className="bg-[#1A1A1A] p-5 rounded-2xl border border-white/5 cursor-pointer hover:border-[#ff4d00]/50 transition-all group"
                    >
                      <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider group-hover:text-[#ff4d00]/70 transition-colors">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      {post.content && (
                        <p className="text-white/90 text-sm md:text-base mb-4 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>
                      )}
                      {post.media_url && (
                        isVideo(post.media_url) ? (
                          <video src={post.media_url} controls loop playsInline preload="metadata" className="w-full max-h-64 rounded-xl mb-4 border border-white/5 bg-black/40" />
                        ) : (
                          <img src={post.media_url} className="w-full max-h-64 object-cover rounded-xl mb-4 border border-white/5" />
                        )
                      )}
                      <div className="flex gap-4 text-white/40">
                        <div className="flex items-center gap-1.5">
                          <Heart size={16} className={post.post_likes?.length > 0 ? "text-[#ff4d00]" : ""} /> 
                          <span className="text-xs font-bold">{post.post_likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={16} /> 
                          <span className="text-xs font-bold">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#131313] border border-white/5 rounded-[2rem] p-8 mt-10 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-white">Edit Profile</h2>
            <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white">Cancel</button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-[#ff4d00] p-0.5 overflow-hidden bg-black">
                {avatarPreview ? <img src={avatarPreview} className="w-full h-full rounded-full object-cover" /> : <User size={32} className="m-auto mt-4 text-white/20" />}
              </div>
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2 border border-white/10">
                <Camera size={16} /> Change Avatar
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  if (e.target.files?.[0]) {
                    setAvatarFile(e.target.files[0]);
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}/>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" />
              </div>
              <div>
                <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="Tell the community about yourself..." />
            </div>
            
            <div>
              <label className="text-xs text-[#ff4d00] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <BookOpen size={14} /> Favorite Verse or Current Reading
              </label>
              <textarea value={bibleVerse} onChange={e => setBibleVerse(e.target.value)} rows={2} className="w-full bg-[#ff4d00]/5 border border-[#ff4d00]/20 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00] placeholder:text-[#ff4d00]/30" placeholder="e.g. Proverbs 3:5-6 or Currently reading through Acts..." />
            </div>

            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Website URL (Optional)</label>
              <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="mikemillermedia.com" />
            </div>
            <div>
              <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2 block">Instagram URL</label>
              <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00]" placeholder="instagram.com/mikemiller" />
            </div>
            
            <div className="pt-6 border-t border-white/10 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold mb-1">Push Notifications</h3>
                  <p className="text-xs text-white/50">Get alerts on this device when someone follows you or posts.</p>
                </div>
                <button 
                  type="button"
                  onClick={handlePushToggle}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${pushEnabled ? 'bg-[#ff4d00]' : 'bg-white/10'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="w-full bg-[#ff4d00] text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-orange-500 transition-colors mt-8">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
