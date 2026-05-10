import React from "react";
import { motion } from "framer-motion";
import { Image } from "../assets/Image";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative flex items-center justify-center z-10">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="absolute w-44 h-44 border-2 border-transparent border-t-primary/40 border-r-primary/10 rounded-full"
        />
        {/* Inner Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute w-36 h-36 border-2 border-transparent border-b-primary/60 border-l-primary/20 rounded-full"
        />

        {/* Logo Container */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative bg-card/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/20 flex items-center justify-center"
        >
          <img
            src={Image.Logo}
            alt="Logo"
            className="w-16 h-16 object-contain filter drop-shadow-lg"
          />
        </motion.div>
      </div>

      <div className="mt-16 flex flex-col items-center z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <h2 className="text-xs font-black text-foreground/40 tracking-[0.6em] uppercase ml-[0.6em]">
            System Loading
          </h2>

          <div className="flex space-x-3 mt-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scanning laser line */}
      <motion.div
        animate={{ y: ["-100vh", "100vh"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0 pointer-events-none"
      />
    </div>
  );
};

export default Loading;