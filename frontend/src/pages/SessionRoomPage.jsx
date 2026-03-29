import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { sessionsApi, messagesApi } from '../api';
import { FullPageSpinner } from '../components/ui/Spinner';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { formatRelativeTime } from '../utils/utils';
import { Send, Smile, Lock, Video as VideoIcon, Mic, MicOff, VideoOff, PhoneOff, AlertTriangle, MessageCircle } from 'lucide-react';

export default function SessionRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isConnected, joinSession, leaveSession, sendMessage, socket } = useSocket();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessionData();
    return () => {
      leaveSession(id);
    };
  }, [id]);

  useEffect(() => {
    if (isConnected && session) {
      joinSession(id);
    }
  }, [isConnected, session, id]);

  useEffect(() => {
    if (!socket) return;

    const handleHistory = (history) => {
      setMessages(history);
      scrollToBottom();
    };

    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    };

    socket.on('messages:history', handleHistory);
    socket.on('message:received', handleNewMessage);

    return () => {
      socket.off('messages:history', handleHistory);
      socket.off('message:received', handleNewMessage);
    };
  }, [socket]);

  const fetchSessionData = async () => {
    try {
      const res = await sessionsApi.get(id);
      setSession(res.session);

      // HTTP fallback if socket history is slow
      const historyRes = await messagesApi.getHistory(id);
      if (messages.length === 0) {
        setMessages(historyRes.messages || []);
      }
    } catch (err) {
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(id, newMessage);
    setNewMessage('');
  };

  if (loading || !session) return <FullPageSpinner />;

  const partner = user.role === 'THERAPIST' ? session.patient : session.therapist?.user;
  const partnerName = user.role === 'THERAPIST' ? session.patient.username : session.therapist?.full_name;

  return (
    <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-40px)] -mt-4 lg:-mt-8 flex flex-col lg:flex-row gap-4">
      
      {/* Left Area: Video/Call Placeholder */}
      <div className="flex-1 lg:flex-[2] bg-bg-card border border-border rounded-xl lg:rounded-2xl overflow-hidden flex flex-col relative h-[40vh] lg:h-full shrink-0">
        {session.type !== 'CHAT' ? (
          <>
            {/* Main Video Area */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50 z-0">
                 <VideoIcon size={64} className="text-white/20 mb-4" />
                 <p className="text-white/40 text-sm font-medium">Waiting for video stream...</p>
                 
                 <div className="mt-8 max-w-sm p-4 bg-accent-amber/20 border border-accent-amber/30 rounded-lg backdrop-blur-md flex items-start gap-3 text-accent-amber text-xs text-left">
                   <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                   <div>
                     <strong className="block mb-1 font-semibold">Demo Note:</strong>
                     Real WebRTC requires a media server integration (e.g., Daily.co, Agora, Twilio). The UI is fully prepared here, but video streams are mocked for this demo. Chat uses live Socket.io!
                   </div>
                 </div>
              </div>
              
              {/* Remote User Info Overlay */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 z-10 flex items-center gap-2">
                <Avatar src={partner?.avatar_url} fallback={partnerName} size="sm" />
                <span className="text-white text-sm font-medium">{partnerName}</span>
              </div>
            </div>
            
            {/* Self Video PIP */}
            <div className="absolute top-4 right-4 w-32 lg:w-48 aspect-video bg-bg-surface border-2 border-border/50 rounded-lg shadow-xl overflow-hidden flex items-center justify-center">
              <Avatar src={user.avatar_url} fallback={user.username} size="md" className="opacity-50" />
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-bg-elevated border-t border-border flex items-center justify-center gap-4 px-4 z-20">
              <button 
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isAudioEnabled ? 'bg-bg-surface hover:bg-bg-card' : 'bg-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white'}`}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button 
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoEnabled ? 'bg-bg-surface hover:bg-bg-card' : 'bg-accent-red/20 text-accent-red hover:bg-accent-red hover:text-white'}`}
              >
                {isVideoEnabled ? <VideoIcon size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button 
                onClick={() => navigate('/sessions')}
                className="w-16 h-12 rounded-full bg-accent-red hover:bg-red-600 flex items-center justify-center text-white shadow-lg shadow-accent-red/30 transition-shadow"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-bg-base/50 p-6 text-center">
            <Avatar src={partner?.avatar_url} fallback={partnerName} size="2xl" className="mb-4 shadow-xl" />
            <h2 className="text-2xl font-display font-bold text-text-primary">{partnerName}</h2>
            <p className="text-text-muted mt-2">Text Chat Session</p>
            <div className="mt-8 px-4 py-2 bg-accent-primary/10 text-accent-primary text-sm rounded-full font-medium border border-accent-primary/20">
              Started {formatRelativeTime(session.scheduled_at)}
            </div>
          </div>
        )}
      </div>

      {/* Right Area: Chat Panel */}
      <div className="flex-1 lg:flex-1 bg-bg-card border border-border rounded-xl lg:rounded-2xl flex flex-col overflow-hidden h-full">
        {/* Chat Header */}
        <div className="h-14 bg-bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
          <h3 className="font-semibold text-text-primary">Session Chat</h3>
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-text-muted bg-bg-base px-2 py-1 rounded-md border border-border/50">
            <Lock size={10} /> End-to-End Encrypted
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-2">
              <MessageCircle size={32} />
              <p className="text-sm font-medium">No messages yet. Say hello!</p>
            </div>
          )}
          
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === user.id;
            const time = new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-2 items-end`}>
                  
                  <Avatar 
                    src={msg.sender?.avatar_url} 
                    fallback={msg.sender?.username} 
                    size="sm" 
                    className="shrink-0 mb-1"
                  />
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isMe 
                        ? 'bg-accent-primary text-white rounded-br-sm' 
                        : 'bg-bg-surface border border-border text-text-primary rounded-bl-sm'
                    }`}>
                      <p className="text-sm shadow-sm">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-text-muted px-1">{time}</span>
                  </div>
                  
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-3 bg-bg-surface border-t border-border shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 relative">
            <button type="button" className="p-2 text-text-muted hover:text-text-primary transition-colors">
              <Smile size={20} />
            </button>
            <Input 
              placeholder="Type a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-full h-10 border-border/50 bg-bg-card"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none hover:bg-accent-primary/90 transition-colors shadow-md"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
