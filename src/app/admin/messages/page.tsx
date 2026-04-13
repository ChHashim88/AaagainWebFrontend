'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle, MailOpen, Mail, Clock, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { user } = useAdminAuthStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user?.token) return;
    try {
      const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/messages', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleMessageClick = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Inbox
          </h1>
          <p className="text-muted-foreground mt-1">Review contact forms and customer inquiries</p>
        </div>
      </div>

      {/* Main Layout containing List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* List Column */}
        <div className={`lg:col-span-4 flex flex-col gap-4 ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Search explicitly..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:bg-white/5 transition-all"
            />
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-2xl overflow-hidden h-[calc(100vh-250px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Scanning frequencies...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No transmissions found.</div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleMessageClick(msg)}
                    className={`p-4 cursor-pointer transition-colors relative border-l-2 ${selectedMessage?.id === msg.id ? 'bg-white/10 border-cyan-400' : 'hover:bg-white/5 border-transparent'} ${!msg.isRead ? 'bg-cyan-500/5' : ''}`}
                  >
                    {!msg.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                    )}
                    <h3 className={`text-base font-bold truncate pr-6 ${!msg.isRead ? 'text-white' : 'text-white/80'}`}>{msg.subject}</h3>
                    <p className={`text-sm truncate ${!msg.isRead ? 'text-cyan-100/70 font-medium' : 'text-muted-foreground'}`}>{msg.name}</p>
                    <p className="text-xs text-muted-foreground/50 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className={`lg:col-span-8 ${!selectedMessage ? 'hidden lg:block' : 'block'}`}>
          {selectedMessage ? (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-8 h-full min-h-[500px] relative overflow-hidden shadow-2xl flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden text-muted-foreground hover:text-white mb-4 flex items-center gap-2"
                >
                  <X className="w-5 h-5" /> Close
                </button>

                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={(e) => deleteMessage(selectedMessage.id, e)}
                    className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Delete Message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-b border-white/10 pb-6 mb-6">
                <h2 className="text-2xl font-black tracking-tight text-white mb-4">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-lg font-black text-black">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{selectedMessage.name}</h3>
                    <p className="text-sm text-cyan-400 font-mono"><a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4">
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedMessage.message}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
              <Mail className="w-16 h-16 text-white/10 mb-4" />
              <h2 className="text-xl font-bold text-white/40 uppercase tracking-widest">No Message Selected</h2>
              <p className="text-white/20 mt-2 max-w-sm">Select a transmission from the left channel to decode its contents.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
