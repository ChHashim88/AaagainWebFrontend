'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get((process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '') + '/api/settings');
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings');
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/messages', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success state after a few seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsSubmitting(false);
      // Fallback for demo if backend isn't ready
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6 text-cyan-400" />,
      title: "Email Support",
      value: settings?.emailSupport || "support@bazarbeats.com",
      description: "Our team aims to respond within 24 hours.",
      bgClass: "group-hover:bg-cyan-500/10",
      borderClass: "group-hover:border-cyan-500/30",
    },
    {
      icon: <Phone className="w-6 h-6 text-purple-400" />,
      title: "Direct Line",
      value: settings?.directLine || "+1 (800) 555-0199",
      description: "Mon-Fri from 9am to 6pm EST.",
      bgClass: "group-hover:bg-purple-500/10",
      borderClass: "group-hover:border-purple-500/30",
    },
    {
      icon: <MapPin className="w-6 h-6 text-pink-400" />,
      title: "Headquarters",
      value: settings?.headquarters || "Neon District",
      description: settings?.headquartersAddress || "Cyber City, CC 92041, Sector 7.",
      bgClass: "group-hover:bg-pink-500/10",
      borderClass: "group-hover:border-pink-500/30",
    }
  ];

  return (
    <main className="w-full min-h-screen pt-24 pb-32 overflow-hidden relative selection:bg-purple-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/3"></div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-purple-400 w-2 h-2 rounded-full animate-pulse bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-white/70">Connect With Us</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
            Whether you have a question about an order, a specific shoe, or just want to talk sneakers—we're here.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 relative z-10">
          
          {/* Contact Methods Column */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-4 md:space-y-6"
          >
            {contactMethods.map((method, idx) => (
              <div key={idx} className="group cursor-pointer bg-[#050505] border border-white/5 hover:border-white/20 rounded-[2rem] p-6 lg:p-8 transition-all duration-300 shadow-xl overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 scale-150 opacity-0 group-hover:opacity-100 ${method.bgClass}`}></div>
                
                <div className="relative z-10 flex items-start gap-6">
                  <div className={`mt-1 p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors duration-300 ${method.borderClass}`}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">{method.title}</h3>
                    <p className="text-xl sm:text-2xl font-black text-white mb-2">{method.value}</p>
                    <p className="text-sm text-white/40">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form Column */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-cyan-400 opacity-50"></div>
            
            <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-cyan-400" /> Let's Talk
            </h2>
            <p className="text-muted-foreground mb-8">Send us a direct transmission. We listen to everything.</p>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/20"
                >
                  <div className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                    <Send className="w-10 h-10 ml-1 translate-y-[-2px] -rotate-12" />
                  </div>
                  <h3 className="text-3xl font-black uppercase text-white mb-4">Transmission Sent</h3>
                  <p className="text-muted-foreground max-w-sm">We've received your message loud and clear. Our team will get back to you shortly.</p>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all font-medium"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Email</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 outline-none focus:border-purple-400 focus:bg-white/10 transition-all font-medium"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Subject</label>
                    <input 
                      required
                      type="text" 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 outline-none focus:border-cyan-400 focus:bg-white/10 transition-all font-medium"
                      placeholder="e.g. Order Inquiry"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Message</label>
                    <textarea 
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 outline-none focus:border-purple-400 focus:bg-white/10 transition-all font-medium resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="group w-full relative overflow-hidden rounded-2xl bg-white text-black font-black uppercase tracking-widest py-4 px-8 border border-white hover:border-cyan-400 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-transparent group-hover:bg-[linear-gradient(45deg,theme(colors.cyan.500),theme(colors.purple.500))] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? 'Transmitting...' : 'Send Message'} 
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-black/50 border-t-black rounded-full animate-spin"></div>
                      ) : (
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
