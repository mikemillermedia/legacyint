import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { User, AlertCircle, MessageCircle, Trash2, Pencil } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRAYER_REACTIONS = ['🙏', '❤️', '🙌', '🫂'];

export default function PrayerWall({ user }: { user: any }) {
  const [, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<any[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);

  // Interaction States
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Edit States
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editRequestContent, setEditRequestContent] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchCurrentUserAvatar();
    }
  }, [user]);

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*, profiles(first_name, last_name, avatar_url), prayer_likes(id, user_id, emoji), prayer_comments(*, profiles(first_name, last_name, avatar_url))')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase Error:", error);
      setErrorMsg(error.message);
    } else if (data) {
      setRequests(data);
      setErrorMsg(null);
    }
    setLoading(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim()) return;
    
    setPosting(true);
    const { data: newPrayerData, error } = await supabase
      .from('prayer_requests')
      .insert([{ 
        user_id: user.id, 
        content: newRequest.trim(),
        is_anonymous: isAnonymous
      }])
      .select()
      .single();
      
    if (!error) {
      // NOTIFY ALL FOLLOWERS OF THE NEW PRAYER REQUEST
      // We only notify followers if it is NOT anonymous to protect privacy
      if (!isAnonymous) {
        const { data: followers } = await supabase.from('follows').select('follower_id').eq('following_id', user.id);
        if (followers && followers.length > 0) {
          const notifications = followers.map(f => ({
            user_id: f.follower_id, 
            actor_id: user.id,      
            type: 'new_prayer',
            post_id: null // Prayer requests aren't chat posts, so we don't link to a specific postId
          }));
          await supabase.from('notifications').insert(notifications);
        }
      }

      setNewRequest('');
      setIsAnonymous(false);
      fetchRequests();
    } else {
      setErrorMsg(error.message);
    }
    setPosting(false);
  };

  const saveEdit = async (requestId: string) => {
    if (!editRequestContent.trim()) return;
    try {
      await supabase.from('prayer_requests').update({ content: editRequestContent.trim(), is_edited: true }).eq('id', requestId);
      setEditingRequestId(null);
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const toggleReaction = async (requestId: string, emoji: string, currentLikes: any[]) => {
    if (!user) return;
    const existingLike = currentLikes.find(like => like.user_id === user.id && like.emoji === emoji);
    
    if (existingLike) {
      await supabase.from('prayer_likes').delete().match({ id: existingLike.id });
    } else {
      await supabase.from('prayer_likes').insert([{ request_id: requestId, user_id: user.id, emoji: emoji }]);
      
      // NOTIFY PRAYER REQUEST OWNER
      const request = requests.find(r => r.id === requestId);
      if (request && request.user_id !== user.id) {
        await supabase.from('notifications').insert([{
          user_id: request.user_id,
          actor_id: user.id,
          type: 'new_prayer_reaction', // You might need to add this text to your Hub.tsx to render it nicely!
          post_id: null 
        }]);
      }
    }
    fetchRequests();
  };

  const submitComment = async (requestId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('prayer_comments').insert([{ request_id: requestId, user_id: user.id, content: commentText.trim() }]);
      
      // NOTIFY PRAYER REQUEST OWNER
      const request = requests.find(r => r.id === requestId);
      if (request && request.user_id !== user.id) {
        await supabase.from('notifications').insert([{
          user_id: request.user_id,
          actor_id: user.id,
          type: 'new_prayer_comment', // You might need to add this text to your Hub.tsx to render it nicely!
          post_id: null 
        }]);
      }

      setCommentText('');
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const deleteRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this prayer request?")) return;
    try {
      await supabase.from('prayer_requests').delete().eq('id', requestId);
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading prayer requests...</div>;

  return (
    <div className="max-w-2xl mx-auto pb-32 animate-in fade-in duration-500">
      
      {errorMsg && (
        <div className="mb-4 bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* FLATTENED COMPOSER BOX */}
      <div className="border-b border-white/10 pb-6 mb-2 relative">
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1 border border-white/5">
            {isAnonymous ? (
              <User size={20} className="text-white/20" />
            ) : currentUserAvatar ? (
              <img src={currentUserAvatar} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-white/20" />
            )}
          </div>
          
          <div className="flex-grow pt-1">
            <textarea 
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              placeholder="Share a prayer request or praise report..." 
              className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-base placeholder:text-white/30 resize-none min-h-[24px] p-0"
              rows={newRequest.split('\n').length > 1 ? newRequest.split('\n').length : 1}
            />
            
            <div className="flex justify-between items-center mt-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/40 hover:text-white transition-colors">
                <input 
                  type="checkbox" 
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-white/20 bg-transparent text-[#ff4d00] focus:ring-[#ff4d00] focus:ring-offset-0 focus:ring-offset-transparent w-4 h-4"
                />
                Post anonymously
              </label>

              <button 
                type="submit" 
                disabled={posting || !newRequest.trim()}
                className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-30"
              >
                {posting ? 'Posting' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* FLATTENED REQUESTS FEED */}
      <div className="flex flex-col">
        {requests.map((request) => {
          const likes = request.prayer_likes || [];
          const comments = request.prayer_comments || [];
          const isMyPost = user?.id === request.user_id;

          const isAnon = request.is_anonymous;
          const firstName = isAnon ? 'Anonymous' : (request.profiles?.first_name || 'Member');
          const lastName = isAnon ? '' : (request.profiles?.last_name || '');
          const avatarUrl = isAnon ? null : request.profiles?.avatar_url;

          return (
            <div key={request.id} className="py-4 border-b border-white/10 transition-colors">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => !isAnon && setSearchParams({ tab: 'activity', viewUser: request.user_id })}
                    className={`w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative z-10 ${!isAnon ? 'cursor-pointer hover:border hover:border-white/20 transition-all' : ''}`}
                  >
                    {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  </div>
                  {openCommentId === request.id && (
                     <div className="w-[1px] flex-grow bg-white/10 my-2" />
                  )}
                </div>

                <div className="flex-grow min-w-0 pb-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <div 
                      className={`group flex items-center gap-1.5 ${!isAnon ? 'cursor-pointer' : ''}`}
                      onClick={() => !isAnon && setSearchParams({ tab: 'activity', viewUser: request.user_id })}
                    >
                      <h3 className={`font-bold text-sm ${isAnon ? 'text-white/60 italic' : 'text-white hover:underline'}`}>
                        {firstName} {lastName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white/40">
                        {new Date(request.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {request.is_edited && <span className="text-[10px] text-white/20 italic ml-1">(edited)</span>}
                      </span>
                      {isMyPost && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingRequestId(request.id); setEditRequestContent(request.content); }} className="text-white/20 hover:text-blue-400 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteRequest(request.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingRequestId === request.id ? (
                    <div className="mb-3 mt-1">
                      <textarea
                        value={editRequestContent}
                        onChange={(e) => setEditRequestContent(e.target.value)}
                        className="w-full bg-transparent border-b border-[#ff4d00]/50 text-[#F5F5F0]/90 focus:ring-0 text-[15px] resize-none p-0"
                        rows={editRequestContent.split('\n').length > 1 ? editRequestContent.split('\n').length : 1}
                      />
                      <div className="flex justify-end gap-3 mt-2">
                        <button onClick={() => setEditingRequestId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                        <button onClick={() => saveEdit(request.id)} className="text-xs text-[#ff4d00] font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#F5F5F0]/90 text-[15px] mb-3 whitespace-pre-wrap leading-relaxed">
                      {request.content}
                    </p>
                  )}
                  
                  {/* THREADS STYLE INTERACTION ROW */}
                  <div className="flex items-center gap-4 mt-1 text-white/40 flex-wrap">
                    <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1">
                      {PRAYER_REACTIONS.map((emoji) => {
                        const reactionCount = likes.filter((l: any) => l.emoji === emoji).length;
                        const hasReacted = likes.some((l: any) => l.user_id === user?.id && l.emoji === emoji);

                        return (
                          <button 
                            key={emoji}
                            onClick={() => toggleReaction(request.id, emoji, likes)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-sm font-medium transition-colors ${
                              hasReacted ? 'bg-[#ff4d00]/20 text-white' : 'hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[16px] leading-none">{emoji}</span>
                            {reactionCount > 0 && <span className="text-[12px]">{reactionCount}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <button 
                      onClick={() => setOpenCommentId(openCommentId === request.id ? null : request.id)} 
                      className={`flex items-center gap-1.5 hover:text-white transition-colors group ml-2 ${openCommentId === request.id ? 'text-white' : ''}`}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors -ml-1.5">
                        <MessageCircle size={16} />
                      </div>
                      {comments.length > 0 && <span className="text-[13px]">{comments.length}</span>}
                    </button>
                  </div>

                  {/* FLATTENED COMMENTS SECTION */}
                  {openCommentId === request.id && (
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
                          onKeyDown={e => e.key === 'Enter' && submitComment(request.id)} 
                          placeholder={`Add a reply or encouragement...`} 
                          className="flex-grow bg-transparent border-none text-[14px] text-white focus:ring-0 p-0 placeholder:text-white/30" 
                        />
                        <button 
                          onClick={() => submitComment(request.id)} 
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
