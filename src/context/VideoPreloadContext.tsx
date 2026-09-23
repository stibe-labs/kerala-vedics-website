"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { getMediaUrl } from "@/lib/media";

export interface PreloadVideoItem {
  id: string;
  path: string;
  title: string;
}

export const LANDING_PAGE_VIDEOS: PreloadVideoItem[] = [
  { id: "hero-bottle", path: "/videos/hero-bottle.mp4", title: "Arshana Lehyam Hero" },
  { id: "freedon", path: "/videos/freedon.mp4", title: "Feedon Fruit Nectar" },
  { id: "roll-on-animation", path: "/videos/roll-on-animation.mp4", title: "Rudra Tulasi Roll-On" },
  { id: "botanical-infusion", path: "/videos/botanical-infusion.mp4", title: "Botanical Infusion" },
  { id: "vericose", path: "/videos/vericose.mp4", title: "Sidd Sutra Circulation" },
  { id: "vitality", path: "/videos/vitality.mp4", title: "Ojas Core Vitality" },
  { id: "feedon-animation", path: "/videos/feedon-animation.mp4", title: "Forest Harvest" },
];

interface VideoPreloadContextType {
  isLoading: boolean;
  progress: number;
  loadedCount: number;
  totalCount: number;
  completedVideos: Record<string, boolean>;
  statusMessage: string;
  finishLoading: () => void;
  getVideoUrl: (path: string) => string;
  isReady: boolean;
}

const VideoPreloadContext = createContext<VideoPreloadContextType | null>(null);

export function VideoPreloadProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  const isStarted = useRef<boolean>(false);

  const getStatusMessage = (prog: number): string => {
    if (prog < 30) return "Awakening ancient botanical wisdom...";
    if (prog < 65) return "Preparing your Ayurvedic sensory sanctuary...";
    if (prog < 95) return "Aligning visual prana...";
    return "Sanctuary Awakened.";
  };

  const statusMessage = getStatusMessage(progress);

  // Manual dismiss only — user clicks "Enter Sanctuary" button
  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const getVideoUrl = useCallback((path: string): string => {
    return getMediaUrl(path);
  }, []);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;

    // ── Prioritize Slide 0 immediately with 100% bandwidth ─────────────────
    const firstVideo = LANDING_PAGE_VIDEOS[0];
    if (firstVideo) {
      try {
        const v = document.createElement("video");
        v.preload = "auto";
        v.muted = true;
        v.playsInline = true;
        v.src = getMediaUrl(firstVideo.path);
        v.load();
      } catch (_) {}
    }

    // ── Stagger remaining videos lazily so network is never saturated ───────
    const remainingTimer = setTimeout(() => {
      LANDING_PAGE_VIDEOS.slice(1).forEach((item, index) => {
        setTimeout(() => {
          try {
            const v = document.createElement("video");
            v.preload = "auto";
            v.muted = true;
            v.playsInline = true;
            v.src = getMediaUrl(item.path);
            v.load();
          } catch (_) {}
        }, index * 2500);
      });
    }, 4000);

    // ── Hard 3-second progress fill ────────────────────────────────────────
    // Progress animates 0 → 100 over exactly MIN_DURATION ms.
    // isReady is only set after the full duration — the Enter button appears
    // only then, so the user can never enter before 3 seconds.
    const MIN_DURATION = 3000;
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / MIN_DURATION) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(progressTimer);
        // Mark ready after a brief hold at 100% so the bar visually completes
        setTimeout(() => {
          setIsReady(true);
          // Auto-dismiss 800ms after ready (after user has seen the full bar)
          setTimeout(() => {
            setIsLoading(false);
          }, 800);
        }, 200);
      }
    }, 25);

    return () => {
      clearInterval(progressTimer);
      isStarted.current = false;
    };
  }, [finishLoading]);

  return (
    <VideoPreloadContext.Provider
      value={{
        isLoading,
        progress,
        loadedCount,
        totalCount: LANDING_PAGE_VIDEOS.length,
        completedVideos,
        statusMessage,
        finishLoading,
        getVideoUrl,
        isReady,
      }}
    >
      {children}
    </VideoPreloadContext.Provider>
  );
}

export function useVideoPreload() {
  const context = useContext(VideoPreloadContext);
  if (!context) {
    throw new Error("useVideoPreload must be used within a VideoPreloadProvider");
  }
  return context;
}

