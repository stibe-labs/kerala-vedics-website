"use client";

import React, { useEffect, useRef } from "react";

export function AmbientVedicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle system (ambient golden dust & subtle sage botanical spores)
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.1, // gently rising like warm steam
      alpha: Math.random() * 0.5 + 0.2,
      maxAlpha: Math.random() * 0.5 + 0.3,
      alphaChange: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.4 ? "200, 157, 74" : "139, 166, 100", // Gold or Sage
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle atmospheric radial illumination
      const gradient = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.6
      );
      gradient.addColorStop(0, "rgba(200, 157, 74, 0.04)");
      gradient.addColorStop(0.5, "rgba(76, 107, 61, 0.02)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render floating particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.alphaChange;

        if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
          p.alphaChange = -p.alphaChange;
        }

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.alpha)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-70"
    />
  );
}
