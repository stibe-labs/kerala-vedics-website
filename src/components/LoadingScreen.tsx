"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPreload } from "@/context/VideoPreloadContext";

export function LoadingScreen() {
  const { isLoading, progress, finishLoading } = useVideoPreload();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="kv-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
          }}
          onClick={finishLoading}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#071108] text-[#FAF8F2] select-none cursor-pointer"
        >
          {/* Subtle ambient warmth */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(39,63,37,0.45) 0%, transparent 65%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center gap-5"
          >
            {/* Minimal Logo */}
            <motion.img
              src="/KV-Logo-w.png"
              alt="Kerala Vedics"
              className="w-14 h-14 object-contain"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Minimal Brand Wordmark */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span
                className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#FAF8F2]/90 font-light"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Kerala Vedics
              </span>
            </div>

            {/* Clean hairline gold progress indicator */}
            <div className="w-28 h-[1.5px] rounded-full overflow-hidden bg-white/10 mt-1">
              <div
                className="h-full bg-[#EDC918] rounded-full transition-all duration-150 ease-out"
                style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
