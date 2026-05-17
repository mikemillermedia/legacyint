import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, MessageCircle, User, ImageIcon, X, AlertCircle, Share2, Repeat, Trash2, BookOpen, Pencil } from 'lucide-react';
import { supabase } from './supabaseClient'; 

export default function CommunityChat({ user }: { user: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetPostId = searchParams.get('postId');
  
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openCommentId, setOpenCommentId] = useState<string | null>(targetPostId);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<any>(null);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<'post' | 'comment' | null>(null);

  const [fetchingVerse, setFetchingVerse] = useState(false);
  const verseMatch = newPost.match(/\/verse\s+([1-3]?\s*[a-zA-Z]+\s+\d+:\d+(?:-\d+)?)/i);

  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchCurrentUserAvatar();
      fetchAllMembers(); 
    }
  }, [user]);

  useEffect(() => {
    if (!loading && targetPostId) {
      setTimeout(() => {
        const element = document.getElementById(`post-${targetPostId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, targetPostId]);

  const fetchAllMembers = async () => {
    const { data } = await supabase.from('profiles').select('id, first_name, last_name, avatar_url');
    if (data) setAllMembers(data);
  };

  const fetchCurrentUserAvatar = async () => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
    if (data) setCurrentUserAvatar(data.avatar_url);
  };

  const fetchPosts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('posts')
        .select(`
          *, 
          profiles:user_id (first_name, last_name, avatar_url, instagram_url), 
          post_likes (user_id), 
          comments (*, profiles:user_id (first_name, last_name, avatar_url)),
          original_post:original_post_id (
            id, content, media_url, created_at,
            profiles:user_id (first_name, last_name, avatar_url, instagram_url)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleFetchVerse = async () => {
    if (!verseMatch) return;
    setFetchingVerse(true);
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(verseMatch[1])}`);
      const data = await response.json();
      
      if (data.text) {
         const cleanText = data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
         const replacement = `"${cleanText}" - ${data.reference}`;
         setNewPost(newPost.replace(verseMatch[0], replacement));
      } else {
         setError("Could not find that verse. Please check the spelling!");
      }
    } catch (e) {
      console.error(e);
      setError("Bible API is currently unavailable.");
    }
    setFetchingVerse(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !mediaFile && !repostTarget) return; 
    setPosting(true);
    setError(null);
    let media_url = null;

    try {
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('setups').upload(fileName, mediaFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('setups').getPublicUrl(fileName);
        media_url = publicUrl;
      }

      const { data: newPostData, error: postError } = await supabase.from('posts').insert([{ 
        user_id: user.id, 
        content: newPost.trim(), 
        media_url,
        original_post_id: repostTarget?.id || null 
      }]).select().single();
      
      if (postError) throw postError;

      // NOTIFY TARGET OF REPOST ONLY (Removed global 'new_post' follower notification)
      if (repostTarget && repostTarget.user_id !== user.id) {
        await supabase.from('notifications').insert([{
          user_id: repostTarget.user_id,
          actor_id: user.id,
          type: 'repost',
          post_id: newPostData.id
        }]);
      }

      setNewPost('');
      setMediaFile(null);
      setMediaPreview(null);
      setRepostTarget(null);
      await fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
    setPosting(false);
  };

  const saveEdit = async (postId: string) => {
    if (!editContent.trim()) return;
    try {
      await supabase.from('posts').update({ content: editContent.trim(), is_edited: true }).eq('id', postId);
      setEditingPostId(null);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const toggleLike = async (postId: string, currentLikes: any[] = []) => {
    if (!user) return;
    const isLiked = currentLikes.some(like => like.user_id === user.id);
    try {
      if (isLiked) {
        await supabase.from('post_likes').delete().match({ post_id: postId, user_id: user.id });
      } else {
        await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
        
        // NOTIFY POST OWNER
        const post = posts.find(p => p.id === postId);
        if (post && post.user_id !== user.id) {
          await supabase.from('notifications').insert([{
            user_id: post.user_id,
            actor_id: user.id,
            type: 'post_like',
            post_id: postId
          }]);
        }
      }
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const submitComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    try {
      await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, content: commentText.trim() }]);
      
      // NOTIFY POST OWNER
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== user.id) {
        await supabase.from('notifications').insert([{
          user_id: post.user_id,
          actor_id: user.id,
          type: 'new_comment',
          post_id: postId
        }]);
      }

      setCommentText('');
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}/hub?tab=chat&postId=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(postId);
      setTimeout(() => setCopiedId(null), 2000); 

      // NOTIFY POST OWNER
      const post = posts.find(p => p.id === postId);
      if (post && post.user_id !== user.id) {
        await supabase.from('notifications').insert([{
          user_id: post.user_id,
          actor_id: user.id,
          type: 'post_share',
          post_id: postId
        }]);
      }
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const initiateRepost = (post: any) => {
    setRepostTarget(post.original_post || post);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await supabase.from('posts').delete().eq('id', postId);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const renderContentWithMentions = (text: string) => {
    if (!text) return null;
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return <span key={index} className="text-[#ff4d00] cursor-pointer hover:underline">{part}</span>;
      }
      return part;
    });
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, target: 'post' | 'comment') => {
    const val = e.target.value;
    if (target === 'post') setNewPost(val);
    if (target === 'comment') setCommentText(val);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);

    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setMentionTarget(target);
    } else {
      setMentionQuery(null);
      setMentionTarget(null);
    }
  };

  const insertMention = (member: any) => {
    const mentionName = `@${member.first_name || ''}${member.last_name || ''}`.replace(/\s+/g, '');
    
    if (mentionTarget === 'post') {
      const newText = newPost.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1${mentionName} `);
      setNewPost(newText);
    } else if (mentionTarget === 'comment') {
      const newText = commentText.replace(/(^|\s)@([a-zA-Z0-9_]*)$/, `$1${mentionName} `);
      setCommentText(newText);
    }
    
    setMentionQuery(null);
    setMentionTarget(null);
  };

  const filteredMentions = mentionQuery !== null
    ? allMembers.filter(m => {
        const fullName = `${m.first_name || ''}${m.last_name || ''}`.toLowerCase();
        return fullName.includes(mentionQuery);
      }).slice(0, 5) 
    : [];

  const MentionDropdown = () => {
    if (mentionQuery === null || filteredMentions.length === 0) return null;
    return (
      <div className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-[#131313] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
        <div className="p-2 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 bg-white/5">Mentions</div>
        {filteredMentions.map(m => (
          <div 
            key={m.id} 
            onClick={() => insertMention(m)} 
            className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
              {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User size={12} className="text-white/20" />}
            </div>
            <span className="text-sm font-medium text-white truncate">{m.first_name} {m.last_name}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading threads...</div>;

  const isVideo = (url: string | null) => url?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto pb-32">
      {error && (
        <div className="mb-4 bg-red-500/10 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X size={14}/></button>
        </div>
      )}

      {/* FLATTENED COMPOSER BOX */}
      <div className="border-b border-white/10 pb-6 mb-2 relative">
        {mentionTarget === 'post' && <MentionDropdown />}
        
        <form onSubmit={handlePost} className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center mt-1">
            {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
          </div>
          
          <div className="flex-grow pt-1">
            <textarea 
              value={newPost} 
              onChange={e => handleTextInput(e, 'post')} 
              placeholder={repostTarget ? "Add a quote to this repost..." : "Start a thread..."} 
              className="w-full bg-transparent border-none text-[#F5F5F0] focus:ring-0 text-base placeholder:text-white/30 resize-none min-h-[24px] p-0" 
              rows={newPost.split('\n').length > 1 ? newPost.split('\n').length : 1}
            />
            
            {mediaPreview && (
              <div className="mt-3 relative inline-block">
                {mediaFile?.type.startsWith('video/') ? (
                  <video src={mediaPreview} controls loop playsInline className="rounded-xl max-h-64 border border-white/10" />
                ) : (
                  <img src={mediaPreview} className="rounded-xl max-h-64 border border-white/10" />
                )}
                <button type="button" onClick={() => {setMediaFile(null); setMediaPreview(null);}} className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1.5 text-white rounded-full hover:bg-black transition-colors"><X size={14}/></button>
              </div>
            )}

            {repostTarget && (
              <div className="mt-3 p-3 border border-white/10 rounded-xl relative">
                <button type="button" onClick={() => setRepostTarget(null)} className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors"><X size={14}/></button>
                <div className="flex items-center gap-2 mb-1 text-white/40">
                  <Repeat size={12} />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Quote Repost</p>
                </div>
                <p className="text-sm text-white/80 line-clamp-2">{repostTarget.content}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-2">
               <div className="flex items-center gap-4 text-white/40">
                 <label className="cursor-pointer hover:text-white transition-colors">
                   <ImageIcon size={18} />
                   <input type="file" className="hidden" accept="image/*,video/*" onChange={e => {
                     if (e.target.files?.[0]) { setMediaFile(e.target.files[0]); setMediaPreview(URL.createObjectURL(e.target.files[0])); }
                   }} />
                 </label>
                 
                 {verseMatch && (
                   <button 
                     type="button" 
                     onClick={handleFetchVerse}
                     disabled={fetchingVerse}
                     className="flex items-center gap-1.5 text-xs text-[#ff4d00] hover:text-orange-400 transition-colors"
                   >
                     <BookOpen size={14} /> {fetchingVerse ? 'Fetching...' : `Fetch ${verseMatch[1]}`}
                   </button>
                 )}
               </div>

               <button type="submit" disabled={posting || (!newPost.trim() && !mediaFile && !repostTarget)} className="bg-white text-black px-5 py-1.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-30">
                 {posting ? 'Posting' : 'Post'}
               </button>
            </div>
          </div>
        </form>
      </div>

      {/* FLATTENED POSTS FEED */}
      <div className="flex flex-col">
        {posts.map((post) => {
          const postLikes = post.post_likes || [];
          const postComments = post.comments || [];
          const isLiked = postLikes.some((l: any) => l.user_id === user?.id);
          const isTargeted = targetPostId === post.id;
          const isMyPost = user?.id === post.user_id;

          return (
            <div 
              key={post.id} 
              id={`post-${post.id}`} 
              className={`py-4 border-b border-white/10 transition-colors ${isTargeted ? 'bg-white/5 px-4 -mx-4 rounded-xl' : ''}`}
            >
              
              {post.original_post && (
                <div className="flex items-center gap-2 text-white/40 text-[11px] font-bold mb-2 ml-14">
                  <Repeat size={12} /> {post.profiles?.first_name} Reposted
                </div>
              )}

              <div className="flex gap-4">
                {/* The "Thread Line" Column */}
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => setSearchParams({ tab: 'activity', viewUser: post.user_id })}
                    className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer relative z-10 hover:border hover:border-white/20 transition-all"
                  >
                    {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  </div>
                  {openCommentId === post.id && (
                     <div className="w-[1px] flex-grow bg-white/10 my-2" />
                  )}
                </div>

                <div className="flex-grow min-w-0 pb-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <div 
                      onClick={() => setSearchParams({ tab: 'activity', viewUser: post.user_id })} 
                      className="group flex items-center gap-1.5 cursor-pointer"
                    >
                      <h3 className="font-bold text-sm text-white hover:underline">{post.profiles?.first_name || 'Member'} {post.profiles?.last_name || ''}</h3>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white/40">
                        {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {post.is_edited && <span className="text-[10px] text-white/20 italic ml-1">(edited)</span>}
                      </span>
                      {isMyPost && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="text-white/20 hover:text-blue-400 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deletePost(post.id)} className="text-white/20 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingPostId === post.id ? (
                    <div className="mb-3 mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-transparent border-b border-[#ff4d00]/50 text-[#F5F5F0]/90 focus:ring-0 text-[15px] resize-none p-0"
                        rows={editContent.split('\n').length > 1 ? editContent.split('\n').length : 1}
                      />
                      <div className="flex justify-end gap-3 mt-2">
                        <button onClick={() => setEditingPostId(null)} className="text-xs text-white/40 hover:text-white">Cancel</button>
                        <button onClick={() => saveEdit(post.id)} className="text-xs text-[#ff4d00] font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    post.content && <p className="text-[#F5F5F0]/90 text-[15px] mb-3 whitespace-pre-wrap leading-relaxed">{renderContentWithMentions(post.content)}</p>
                  )}
                  
                  {post.media_url && (
                    isVideo(post.media_url) ? (
                      <video src={post.media_url} controls loop playsInline preload="metadata" className="mb-3 rounded-xl border border-white/10 max-h-[500px] w-auto bg-black/40" />
                    ) : (
                      <img src={post.media_url} className="mb-3 rounded-xl border border-white/10 max-h-[500px] w-auto object-contain bg-black/40" />
                    )
                  )}
                  
                  {post.original_post && (
                    <div className="mb-3 p-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div 
                          className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-white/5 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setSearchParams({ tab: 'activity', viewUser: post.original_post.user_id }); }}
                        >
                          {post.original_post.profiles?.avatar_url ? <img src={post.original_post.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={10} className="text-white/20" />}
                        </div>
                        <span 
                          className="text-sm font-bold text-white cursor-pointer hover:underline"
                          onClick={(e) => { e.stopPropagation(); setSearchParams({ tab: 'activity', viewUser: post.original_post.user_id }); }}
                        >
                          {post.original_post.profiles?.first_name} {post.original_post.profiles?.last_name}
                        </span>
                        <span className="text-xs text-white/40">· {new Date(post.original_post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="text-[15px] text-white/80 whitespace-pre-wrap">{renderContentWithMentions(post.original_post.content)}</p>
                      
                      {post.original_post.media_url && (
                        isVideo(post.original_post.media_url) ? (
                          <video src={post.original_post.media_url} controls loop playsInline preload="metadata" className="mt-2 rounded-lg border border-white/10 max-h-48 w-auto bg-black/40" />
                        ) : (
                          <img src={post.original_post.media_url} className="mt-2 rounded-lg border border-white/10 max-h-48 w-auto object-cover" />
                        )
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 mt-1 text-white/40">
                    <button onClick={() => toggleLike(post.id, postLikes)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors group ${isLiked ? 'text-red-500' : ''}`}>
                      <div className="p-1.5 rounded-full group-hover:bg-red-500/10 transition-colors -ml-1.5">
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                      </div>
                      {postLikes.length > 0 && <span className="text-[13px]">{postLikes.length}</span>}
                    </button>
                    
                    <button onClick={() => setOpenCommentId(openCommentId === post.id ? null : post.id)} className={`flex items-center gap-1.5 hover:text-white transition-colors group ${openCommentId === post.id ? 'text-white' : ''}`}>
                      <div className="p-1.5 rounded-full group-hover:bg-white/10 transition-colors -ml-1.5">
                        <MessageCircle size={16} />
                      </div>
                      {postComments.length > 0 && <span className="text-[13px]">{postComments.length}</span>}
                    </button>
                    
                    <button onClick={() => initiateRepost(post)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors group">
                      <div className="p-1.5 rounded-full group-hover:bg-green-400/10 transition-colors -ml-1.5">
                        <Repeat size={16} />
                      </div>
                    </button>
                    
                    <button onClick={() => handleShare(post.id)} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors group relative">
                      <div className="p-1.5 rounded-full group-hover:bg-blue-400/10 transition-colors -ml-1.5">
                        <Share2 size={16} />
                      </div>
                      {copiedId === post.id && (
                        <span className="absolute -top-6 -left-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded">Copied!</span>
                      )}
                    </button>
                  </div>

                  {openCommentId === post.id && (
                    <div className="mt-3 space-y-4 relative animate-in fade-in slide-in-from-top-2">
                      {mentionTarget === 'comment' && <MentionDropdown />}
                      
                      {postComments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 items-start pt-2">
                          <div 
                            className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer hover:border hover:border-white/20 transition-all"
                            onClick={() => setSearchParams({ tab: 'activity', viewUser: c.user_id })}
                          >
                            {c.profiles?.avatar_url ? <img src={c.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                          </div>
                          <div className="flex-grow pt-1">
                            <p 
                              className="text-[13px] font-bold text-white mb-0.5 cursor-pointer hover:underline inline-block"
                              onClick={() => setSearchParams({ tab: 'activity', viewUser: c.user_id })}
                            >
                              {c.profiles?.first_name || 'Member'}
                            </p>
                            <p className="text-[14px] text-white/80 leading-snug">{renderContentWithMentions(c.content)}</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3 items-center pt-3 mt-2 border-t border-white/5">
                        <div className="w-8 h-8 rounded-full bg-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {currentUserAvatar ? <img src={currentUserAvatar} className="w-full h-full object-cover" /> : <User size={14} className="text-white/20" />}
                        </div>
                        <input 
                          value={commentText} 
                          onChange={e => handleTextInput(e as any, 'comment')} 
                          onKeyDown={e => e.key === 'Enter' && submitComment(post.id)} 
                          placeholder={`Reply to ${post.profiles?.first_name || 'Member'}...`} 
                          className="flex-grow bg-transparent border-none text-[14px] text-white focus:ring-0 p-0 placeholder:text-white/30" 
                        />
                        <button onClick={() => submitComment(post.id)} disabled={!commentText.trim()} className="text-[#ff4d00] font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed">Post</button>
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
