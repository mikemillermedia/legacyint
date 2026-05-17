import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, User, Trash2, Mail, MessageCircle, Share2, Heart, Repeat, X, Pencil } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CollabBoard({ user }: { user: any }) {
  const [, setSearchParams] = useSearchParams();
  const [collabs, setCollabs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Interaction States
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<any>(null);

  // Edit States
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchCollabs();
      fetchCurrentUserAvatar();
    }
  }, [user]);

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchCollabs = async () => {
    const { data } = await supabase
      .from('collabs')
      .select(`
        *, 
        profiles:user_id(first_name, last_name, avatar_url, instagram_url), 
        collab_comments(*, profiles:user_id(first_name, last_name, avatar_url)),
        collab_likes(user_id),
        original_collab:original_collab_id(
          id, title, description, created_at,
          profiles:user_id(first_name, last_name, avatar_url)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setCollabs(data);
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setPosting(true);
    await supabase.from('collabs').insert([{ 
      user_id: user.id, 
      title: title.trim(),
      description: description.trim(),
      original_collab_id: repostTarget?.id || null 
    }]);
      
    setTitle('');
    setDescription('');
    setRepostTarget(null);
    fetchCollabs();
    setPosting(false);
  };

  const saveEdit = async (collabId: string) => {
    if (!editTitle.trim() || !editDescription.trim()) return;
    try {
      await supabase.from('collabs').update({ 
        title: editTitle.trim(), 
        description: editDescription.trim(), 
        is_edited: true 
      }).eq('id', collabId);
      setEditingCollabId(null);
      fetchCollabs();
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (collabId: string, currentLikes: any[] = []) => {
    if (!user) return;
    const isLiked = currentLikes.some(like => like.user_id === user.id);
    try {
      if (isLiked) {
        await supabase.from('collab_likes').delete().match({ collab_id: collabId, user_id: user.id });
      } else {
        await supabase.from('collab_likes').insert([{ collab_id: collabId, user_id: user.id }]);
      }
      fetchCollabs();
    } catch (e) { console.error(e); }
  };

  const submitComment = async (collabId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('collab_comments').insert([{ collab_id: collabId, user_id: user.id, content: commentText.trim() }]);
      setCommentText('');
      fetchCollabs();
    } catch (e) { console.error(e); }
  };

  const initiateRepost = (collab: any) => {
    setRepostTarget(collab.original_collab || collab);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const deleteCollab = async (collabId: string) => {
    if (!window.confirm("Delete this collab request?")) return;
    await supabase.from('collabs').delete().eq('id', collabId);
    fetchCollabs();
  };

  const handleShare = async (collabId: string) => {
    const url = `${window.location.origin}/hub?tab=collabs&collabId=${collabId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(collabId);
      setTimeout(() => setCopiedId(null), 2000); 
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading Collab Board...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-32 animate-in fade-in duration-500">
      
      {/* FLATTENED COMPOSER BOX */}
      <div className="border-b border-white/10 pb-6 mb-2 relative">
        <div className="flex items-center gap-2 mb-4 text-[#ff4d00] font-bold uppercase tracking-widest text-xs">
          <Briefcase size={14} /> Post a Collab
        </div>
        
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1 border border-white/5">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
          </div>
          
          <div className="flex-grow pt-1">
            {repostTarget && (
              <div className="mb-3 p-3 border border-white/10 rounded-xl relative bg-white/5">
                <button type="button" onClick={() => setRepostTarget(null)} className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"><X size={14}/></button>
                <div className="flex items-center gap-2 mb-1 text-white/40">
                  <Repeat size={12} />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Quote Repost</p>
                </div>
                <p className="text-sm font-bold text-[#ff4d00]">{repostTarget.title}</p>
                <p className="text-sm text-white/80 line-clamp-2">{repostTarget.description}</p>
              </div>
            )}

            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={repostTarget ? "Why are you sharing this gig?" : "What are you looking for? (e.g. Need a Video Editor)"} 
              className="w-full bg-transparent border-none font-bold text-[#F5F5F0] focus:ring-0 text-base placeholder:text-white/40 p-0 mb-1"
            />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={repostTarget ? "Add your own thoughts..." : "Add details about the project, your budget, or skills needed..."} 
              className="w-full bg-transparent border-none text-[#F5F5F0]/80 focus:ring-0 text-[15px] placeholder:text-white/30 resize-none min-h-[40px] p-0"
              rows={description.split('\n').length > 2 ? description.split('\n').length : 2}
            />
            
            <div className="flex justify-end items-center mt-3 pt-2">
              <button 
                type="submit" 
                disabled={posting || !title.trim() || !description.trim()}
                className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-30"
              >
                {posting ? 'Posting' : (repostTarget ? 'Repost Collab' : 'Post Gig')}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* FLATTENED COLLABS FEED */}
      <div className="flex flex-col">
        {collabs.map((collab) => {
          const isMyPost = user?.id === collab.user_id;
          const comments = collab.collab_comments || [];
          const likes = collab.collab_likes || [];
          const isLiked = likes.some((l: any) => l.user_id === user?.id);

          return (
            <div key={collab.id} className="py-4 border-b border-white/10 transition-colors">
              
              {collab.original_collab && (
                <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold mb-2 ml-14">
                  <Repeat size={12} /> {collab.profiles?.first_name} Reposted
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSearchParams({ tab: 'activity', viewUser: collab.user_id })}
                    className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer relative z-10 hover:border hover:border-white/20 transition-all"
                  >
                    {collab.profiles?.avatar_url ? <img src={collab.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  </div>
                  {openCommentId === collab.id && (
                     <div className="w-[1px] flex-grow bg-white/10 my-2" />
                  )}
                </div>

                <div className="flex-grow min-w-0 pb-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <div 
                      className="group flex items-center gap-1.5 cursor-pointer"
                      onClick={() => setSearchParams({ tab: 'activity', viewUser: collab.user_id })}
                    >
                      <h3 className="font-bold text-sm text-white hover:underline">
                        {collab.profiles?.first_name} {collab.profiles?.last_name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white/40">
                        {new Date(collab.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {collab.is_edited && <span className="text-[10px] text-white/20 italic ml-1">(edited)</span>}
                      </span>
                      {isMyPost && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingCollabId(collab.id); setEditTitle(collab.title); setEditDescription(collab.description); }} className="text-white/20 hover:text-blue-400 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteCollab(collab.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingCollabId === collab.id ? (
                    <div className="mb-3 mt-1 space-y-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border-b border-[#ff4d00]/50 text-[#ff4d00] font-bold focus:ring-0 text-[15px] p-0"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full bg-transparent border-b border-[#ff4d00]/50 text-[#F5F5F0]/90 focus:ring-0 text-[15px] resize-none p-0"
                        rows={editDescription.split('\n').length > 1 ? editDescription.split('\n').length : 1}
                      />
                      <div className="flex justify-end gap-3 mt-2">
                        <button onClick={() => setEditingCollabId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                        <button onClick={() => saveEdit(collab.id)} className="text-xs text-[#ff4d00] font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-[15px] font-bold text-[#ff4d00] mb-1">{collab.title}</h4>
                      <p className="text-[#F5F5F0]/90 text-[15px] mb-3 whitespace-pre-wrap leading-relaxed">
                        {collab.description}
                      </p>
                    </>
                  )}

                  {collab.original_collab && (
                    <div className="mb-3 p-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-white/5">
                          {collab.original_collab.profiles?.avatar_url ? <img src={collab.original_collab.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="text-white/20" />}
                        </div>
                        <span className="text-sm font-bold text-white">{collab.original_collab.profiles?.first_name} {collab.original_collab.profiles?.last_name}</span>
                        <span className="text-xs text-white/40">· {new Date(collab.original_collab.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h4 className="text-[14px] font-bold text-[#ff4d00] mb-1">{collab.original_collab.title}</h4>
                      <p className="text-[14px] text-white/80 whitespace-pre-wrap">{collab.original_collab.description}</p>
                    </div>
                  )}
                  
                  {/* THREADS STYLE INTERACTION ROW */}
                  <div className="flex items-center gap-6 mt-1 text-white/40">
                    <button 
                      onClick={() => toggleLike(collab.id, likes)} 
                      className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors -ml-1.5">
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </div>
                      {likes.length > 0 && <span className="text-[13px]">{likes.length}</span>}
                    </button>

                    <button 
                      onClick={() => setOpenCommentId(openCommentId === collab.id ? null : collab.id)} 
                      className={`flex items-center gap-1.5 hover:text-white transition-colors group ${openCommentId === collab.id ? 'text-white' : ''}`}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors -ml-1.5">
                        <MessageCircle size={16} />
                      </div>
                      {comments.length > 0 && <span className="text-[13px]">{comments.length}</span>}
                    </button>

                    <button 
                      onClick={() => initiateRepost(collab)} 
                      className="flex items-center gap-1.5 hover:text-green-400 transition-colors group"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-green-400/10 transition-colors -ml-1.5">
                        <Repeat size={16} />
                      </div>
                    </button>

                    {!isMyPost && (
                      <button 
                        onClick={() => setSearchParams({ tab: 'messages', userId: collab.user_id })}
                        className="flex items-center gap-1.5 hover:text-[#ff4d00] transition-colors group"
                        title="Direct Message"
                      >
                        <div className="p-1.5 rounded-full group-hover:bg-[#ff4d00]/10 transition-colors -ml-1.5">
                          <Mail size={16} />
                        </div>
                      </button>
                    )}

                    <button onClick={() => handleShare(collab.id)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group relative" title="Share Collab">
                      <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors -ml-1.5">
                        <Share2 size={16} />
                      </div>
                      {copiedId === collab.id && (
                        <span className="absolute -top-6 -left-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded">Copied!</span>
                      )}
                    </button>
                  </div>

                  {/* FLATTENED COMMENTS SECTION */}
                  {openCommentId === collab.id && (
                    <div className="mt-3 space-y-4 relative animate-in fade-in slide-in-from-top-2">
                      {comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start pt-2">
                          <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                          </div>
                          <div className="flex-grow pt-1">
                            <p className="text-[13px] font-bold text-white mb-0.5">{c.profiles?.first_name || 'Member'}</p>
                            <p className="text-[14px] text-white/80 leading-snug">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3 items-center pt-3 mt-2 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                        </div>
                        <input 
                          value={commentText} 
                          onChange={(e) => setCommentText(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && submitComment(collab.id)} 
                          placeholder={`Reply to ${collab.profiles?.first_name || 'Member'}...`} 
                          className="flex-grow bg-transparent border-none text-[14px] text-white focus:ring-0 p-0 placeholder:text-white/30" 
                        />
                        <button 
                          onClick={() => submitComment(collab.id)} 
                          disabled={!commentText.trim()} 
                          className="text-[#ff4d00] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
