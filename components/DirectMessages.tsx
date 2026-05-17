import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams } from 'react-router-dom';
import { Send, User, ArrowLeft, MessageSquare } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DirectMessages({ user }: { user: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId'); 

  const [inboxUsers, setInboxUsers] = useState<any[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchInbox();
    }
  }, [user]);

  useEffect(() => {
    if (targetUserId && user) {
      loadSpecificUser(targetUserId);
    } else if (!targetUserId) {
      setActiveChatUser(null);
    }
  }, [targetUserId, user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime_dms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, payload => {
        const newMsg = payload.new;
        
        // Only append if it's for the current chat, AND if it's not a message we just sent ourselves (to prevent duplicates)
        if (activeChatUser && newMsg.sender_id !== user.id && ((newMsg.sender_id === user.id && newMsg.receiver_id === activeChatUser.id) || (newMsg.sender_id === activeChatUser.id && newMsg.receiver_id === user.id))) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
        fetchInbox();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSpecificUser = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) {
      setActiveChatUser(data);
      fetchMessages(data.id);
    }
  };

  const fetchInbox = async () => {
    const { data } = await supabase
      .from('direct_messages')
      .select('*, sender:sender_id(id, first_name, last_name, avatar_url), receiver:receiver_id(id, first_name, last_name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      const uniqueUsers = new Map();
      data.forEach((msg: any) => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender;
        if (!uniqueUsers.has(otherUser.id)) {
          uniqueUsers.set(otherUser.id, { user: otherUser, latestMessage: msg });
        }
      });
      setInboxUsers(Array.from(uniqueUsers.values()));
    }
    setLoading(false);
  };

  const fetchMessages = async (otherUserId: string) => {
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);

    await supabase.from('direct_messages').update({ is_read: true }).eq('sender_id', otherUserId).eq('receiver_id', user.id).eq('is_read', false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;

    const msgContent = newMessage.trim();
    setNewMessage(''); // Clear input box

    // FIX: Ask Supabase to return the newly created message right away
    const { data: insertedMsg, error } = await supabase.from('direct_messages').insert([{
      sender_id: user.id,
      receiver_id: activeChatUser.id,
      content: msgContent
    }]).select().single();
    
    // FIX: Instantly put your own message on the screen!
    if (!error && insertedMsg) {
      setMessages(prev => [...prev, insertedMsg]);
      fetchInbox(); // Refresh the left panel so your new message shows as the latest
    }

    await supabase.from('notifications').insert([{
      user_id: activeChatUser.id,
      actor_id: user.id,
      type: 'new_dm'
    }]);
  };

  if (loading) return <div className="text-center py-20 text-white/40">Loading messages...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT SIDE: INBOX LIST */}
      <div className={`w-full md:w-1/3 h-full bg-[#1A1A1A] border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col ${activeChatUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Inbox</h2>
        </div>
        <div className="overflow-y-auto flex-grow p-2">
          {inboxUsers.length === 0 ? (
            <p className="text-white/40 text-center p-8 text-sm">No messages yet. Go to the directory to start a chat!</p>
          ) : (
            inboxUsers.map(({ user: u, latestMessage }) => (
              <div 
                key={u.id} 
                onClick={() => setSearchParams({ tab: 'messages', userId: u.id })}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${activeChatUser?.id === u.id ? 'bg-[#ff4d00]/10 border border-[#ff4d00]/30' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full bg-black overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center relative">
                  {u?.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                  {latestMessage.receiver_id === user.id && !latestMessage.is_read && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className={`text-sm truncate ${latestMessage.receiver_id === user.id && !latestMessage.is_read ? 'font-bold text-white' : 'font-bold text-white/80'}`}>{u?.first_name} {u?.last_name}</h3>
                  <p className={`text-xs truncate ${latestMessage.receiver_id === user.id && !latestMessage.is_read ? 'text-[#ff4d00] font-medium' : 'text-white/40'}`}>
                    {latestMessage.sender_id === user.id ? 'You: ' : ''}{latestMessage.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: CHAT WINDOW */}
      <div className={`w-full md:w-2/3 h-full bg-[#1A1A1A] border border-white/5 rounded-3xl shadow-xl overflow-hidden flex flex-col ${!activeChatUser ? 'hidden md:flex' : 'flex'}`}>
        {!activeChatUser ? (
          <div className="m-auto flex flex-col items-center opacity-30">
            <MessageSquare size={64} className="mb-4" />
            <p className="text-xl font-bold uppercase tracking-widest">Select a message</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 flex items-center gap-4">
              <button onClick={() => setSearchParams({ tab: 'messages' })} className="md:hidden text-white/50 hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setSearchParams({ tab: 'activity', viewUser: activeChatUser.id })}
              >
                <div className="w-10 h-10 rounded-full bg-black overflow-hidden flex-shrink-0 border border-[#ff4d00]/50 flex items-center justify-center">
                  {activeChatUser?.avatar_url ? <img src={activeChatUser.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-white/20" />}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-[#ff4d00] transition-colors">{activeChatUser.first_name} {activeChatUser.last_name}</h3>
                  <p className="text-xs text-white/40">View Profile</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                      isMe 
                        ? 'bg-[#ff4d00] text-white rounded-tr-sm' 
                        : 'bg-white/5 border border-white/10 text-white rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-white/20 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/5 bg-[#131313]">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  placeholder="Type a message..." 
                  className="flex-grow bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:ring-1 focus:ring-[#ff4d00] text-white focus:outline-none" 
                />
                <button type="submit" disabled={!newMessage.trim()} className="bg-[#ff4d00] text-white p-3 rounded-full hover:bg-orange-500 transition-colors disabled:opacity-50">
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
