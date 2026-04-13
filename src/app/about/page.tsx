'use client';

import { motion } from 'framer-motion';
import { Target, CheckCircle2, Leaf, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const features = [
    { text: "100% authentic branded shoes", icon: <CheckCircle2 className="w-5 h-5 text-cyan-400" /> },
    { text: "Carefully inspected & quality-checked", icon: <Sparkles className="w-5 h-5 text-purple-400" /> },
    { text: "Affordable pricing", icon: <Target className="w-5 h-5 text-cyan-400" /> },
    { text: "Sustainable fashion choice", icon: <Leaf className="w-5 h-5 text-green-400" /> },
  ];

  return (
    <main className="w-full min-h-screen pt-24 pb-32 overflow-hidden relative selection:bg-cyan-500/30">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-cyan-400 w-2 h-2 rounded-full animate-pulse bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-white/70">Who We Are</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Us</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
            At Aaagain, we believe style shouldn’t come with a high price tag.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
          {/* Image/Visual Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring" }}
            className="order-2 lg:order-1 relative w-full aspect-square md:aspect-video lg:aspect-square"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-[3rem] blur-2xl z-0 transform -rotate-6 scale-105"></div>
            <div className="absolute inset-0 bg-[#050505] border border-white/10 rounded-[3rem] z-10 overflow-hidden shadow-2xl flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-screen saturate-0 contrast-125"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              <h2 className="relative z-20 text-4xl md:text-6xl font-black uppercase tracking-tighter text-white drop-shadow-2xl opacity-90 text-center">
                Second <br/>
                <span className="text-cyan-400 inline-block mt-2">Chance.</span>
              </h2>
            </div>
          </motion.div>

          {/* Story Text */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 space-y-8 text-lg text-muted-foreground leading-relaxed"
          >
            <p>
              We specialize in authentic thrifted shoes from top global brands, carefully sourced to bring you premium quality at affordable prices. Every pair in our collection goes through a strict inspection and cleaning process, ensuring it meets our standards before reaching you.
            </p>
            <p>
              Our goal is simple — to make branded footwear accessible without compromising on style, comfort, or quality.
            </p>
            <p>
              Whether you're looking for everyday wear or standout pieces, <strong className="text-white font-bold">Aaagain</strong> gives you a second chance to own the brands you love — for less.
            </p>
          </motion.div>
        </div>

        {/* Bottom Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* What Makes Us Different */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#050505] border border-white/10 rounded-[2rem] p-8 md:p-12 hover:border-cyan-400/30 transition-colors shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-400/10 transition-colors"></div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              What Makes Us Different
            </h3>
            
            <ul className="space-y-6">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-4 text-muted-foreground font-medium">
                  <div className="mt-0.5 bg-white/5 p-2 rounded-lg border border-white/10 shadow-inner">
                    {feature.icon}
                  </div>
                  <span className="pt-1.5">{feature.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Vision */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-white/10 rounded-[2rem] p-8 md:p-12 hover:border-purple-400/30 transition-colors shadow-2xl relative overflow-hidden group flex flex-col justify-center"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-400/10 transition-colors"></div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-white flex items-center gap-3">
              <Leaf className="w-6 h-6 text-purple-400" />
              Our Vision
            </h3>
            
            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
              We aim to build a platform where <span className="text-white">fashion meets sustainability</span>, reducing waste while delivering immense value to our customers.
            </p>
            
            <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-8">
              <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">The Goal</p>
                <p className="text-xs text-muted-foreground mt-1">Premium thrifting standard</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
