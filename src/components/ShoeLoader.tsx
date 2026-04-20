'use client';
import { motion } from 'framer-motion';

export default function ShoeLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-8">
      {/* Bouncing Shoe Animation */}
      <motion.div
        className="relative flex items-center justify-center p-4"
        animate={{
          y: [0, -30, 0],
          rotate: [-5, 5, -5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-transparent blur-3xl rounded-full" />

        {/* Sneaker SVG */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 64 64" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-24 h-24 sm:w-32 sm:h-32 text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] z-10"
        >
          {/* Main Shoe Body */}
          <path d="M12.5 45.4C8.6 42.1 4 38 4 33.1v-6.9c0-3.3 2.5-6 5.6-6.4 7-.8 17.5-1.8 28.3 11 2.2 2.7 6.4 5.9 12.1 5.9 5.8 0 10 3 10 7.9v2.7c0 2.2-1.8 4-4 4H15.9c-1.3 0-2.4-.6-3.4-1.9z" />
          {/* Swoosh/Detailing */}
          <path d="M11 20.3c0 0 6.6-4.5 14.5 4 4.5 4.8 10.3 8.1 16 8.5" />
          {/* Laces */}
          <path d="M26.4 18.2c1.7-1.4 5.9-1.3 7 1" />
          <path d="M22.5 24.3c1.7-1.4 5.9-1.3 7 1" />
          <path d="M18.5 30.3c1.7-1.4 5.9-1.3 7 1" />
        </svg>

        {/* Speed Lines */}
        <motion.div
          animate={{ opacity: [0, 1, 0], x: [-10, -30, -10] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute -left-4 top-1/2 w-8 h-1 bg-gradient-to-r from-transparent to-cyan-400/50 rounded-full"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0], x: [-10, -40, -10] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2, ease: "linear" }}
          className="absolute -left-8 top-1/3 w-6 h-1 bg-gradient-to-r from-transparent to-purple-500/50 rounded-full"
        />
      </motion.div>

      {/* Dynamic Text */}
      <div className="flex items-center gap-[2px]">
        <span className="text-cyan-400 font-black uppercase tracking-[0.2em] animate-pulse text-sm sm:text-base">
          Lacing up
        </span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="text-cyan-400 font-black text-xl"
          >
            .
          </motion.span>
        ))}
      </div>
    </div>
  );
}
