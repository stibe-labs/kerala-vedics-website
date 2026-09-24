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
  heroVideoReady: boolean;
  markHeroVideoReady: () => void;
}

const VideoPreloadContext = createContext<VideoPreloadContextType | null>(null);

export function VideoPreloadProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [completedVideos, setCompletedVideos] = useState<Record<string, boolean>>({});
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [heroVideoReady, setHeroVideoReady] = useState<boolean>(false);

  const heroReadyRef = useRef<boolean>(false);
  const isStarted = useRef<boolean>(false);

  const markHeroVideoReady = useCallback(() => {
    if (!heroReadyRef.current) {
      heroReadyRef.current = true;
      setHeroVideoReady(true);
    }
  }, []);

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
        v.oncanplay = () => markHeroVideoReady();
        v.onplaying = () => markHeroVideoReady();
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

    // ── Synchronized progress fill (minimum 3 seconds + video ready) ────────
    // ── Synchronized progress fill (minimum ~1 second + video ready) ────────
    const MIN_DURATION = 1000;
    const MAX_WAIT_DURATION = 2500;
    const startTime = Date.now();

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const isVideoReady = heroReadyRef.current;

      let targetPct = 0;
      if (elapsed < 800) {
        targetPct = Math.round((elapsed / 800) * 90);
      } else if (isVideoReady || elapsed >= MAX_WAIT_DURATION) {
        const finishElapsed = elapsed - 800;
        targetPct = Math.min(100, 90 + Math.round((finishElapsed / 200) * 10));
      } else {
        targetPct = 95;
      }

      setProgress((prev) => Math.max(prev, targetPct));

      if (targetPct >= 100 && elapsed >= MIN_DURATION && (isVideoReady || elapsed >= MAX_WAIT_DURATION)) {
        clearInterval(progressTimer);
        setIsReady(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    }, 30);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(remainingTimer);
      isStarted.current = false;
    };
  }, [finishLoading, markHeroVideoReady]);

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
        heroVideoReady,
        markHeroVideoReady,
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

