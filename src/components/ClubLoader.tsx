import React, { useEffect, useRef, useState } from "react";

export type TargetRect = { left: number; top: number; width: number; height: number };

type Props = {
  logoSrc: string;
  targetRect: TargetRect | null;
  onComplete: () => void;
  durationMs?: number; // durée animation ballons
};

export function ClubLoader({
  logoSrc,
  targetRect,
  onComplete,
  durationMs = 9000,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<"playing" | "fly" | "fade">("playing");
  const [flyTransform, setFlyTransform] = useState<string>("translate(0px, 0px) scale(1)");
  const [logoOpacity, setLogoOpacity] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const balls = [
      { emoji: "⚽", size: 170, bounce: 0.72, spawnDelay: 0 },
      { emoji: "🏀", size: 185, bounce: 0.76, spawnDelay: 250 },
      { emoji: "🏐", size: 165, bounce: 0.74, spawnDelay: 500 },
      { emoji: "🏈", size: 160, bounce: 0.70, spawnDelay: 700 },
      { emoji: "🎾", size: 145, bounce: 0.80, spawnDelay: 900 },
      { emoji: "⚾", size: 140, bounce: 0.78, spawnDelay: 1100 },
    ].map((b) => ({
      ...b,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: 0,
      rot: 0,
      spin: (Math.random() - 0.5) * 0.06,
      initialized: false,
    }));

    const gravity = 0.65;
    const air = 0.999;
    const groundFriction = 0.985;

    let animationId = 0;
    const startTime = performance.now();

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initBall = (ball: any) => {
      ball.x = Math.random() * window.innerWidth;
      ball.y = -ball.size - Math.random() * 400;
      ball.initialized = true;
    };

    const drawBackground = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Fond clair (tu peux remplacer par image/pattern)
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(1, "#f4f7ff");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // halo très léger au centre derrière le logo
      const r = Math.min(w, h) * 0.35;
      const rad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r);
      rad.addColorStop(0, "rgba(37, 99, 235, 0.08)");
      rad.addColorStop(1, "rgba(37, 99, 235, 0.0)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, w, h);

      // ligne de sol discrète
      ctx.strokeStyle = "rgba(37, 99, 235, 0.10)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h - 46);
      ctx.lineTo(w, h - 46);
      ctx.stroke();
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;

      drawBackground();

      const w = window.innerWidth;
      const h = window.innerHeight;
      const ground = h - 46;

      balls.forEach((ball) => {
        if (elapsed < ball.spawnDelay) return;
        if (!ball.initialized) initBall(ball);

        ball.vy += gravity;
        ball.vx *= air;
        ball.vy *= air;

        ball.x += ball.vx;
        ball.y += ball.vy;

        // murs
        if (ball.x - ball.size < 0) {
          ball.x = ball.size;
          ball.vx *= -1;
        } else if (ball.x + ball.size > w) {
          ball.x = w - ball.size;
          ball.vx *= -1;
        }

        // sol
        if (ball.y + ball.size > ground) {
          ball.y = ground - ball.size;
          ball.vy *= -ball.bounce;
          ball.vx *= groundFriction;

          if (Math.abs(ball.vy) < 1.2) ball.vy = 0;
          if (Math.abs(ball.vx) < 0.2) ball.vx = 0;
        }

        ball.rot += ball.spin + ball.vx * 0.002;

        // ombre
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(ball.x, ground + 8, ball.size * 0.60, ball.size * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // emoji
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rot);
        ctx.font = `${ball.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ball.emoji, 0, 0);
        ctx.restore();
      });

      if (elapsed < durationMs) {
        animationId = requestAnimationFrame(animate);
      } else {
        // stop balls, lancer "fly logo"
        setPhase("fly");
      }
    };

    setCanvasSize();
    const onResize = () => setCanvasSize();
    window.addEventListener("resize", onResize);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [durationMs]);

  // Déclenche l’animation “logo -> navbar”
  useEffect(() => {
    if (phase !== "fly") return;

    // Si on n’a pas encore la position du logo cible, on attend un petit peu.
    // (souvent le header n’a pas fini de layout au moment exact)
    const tryCompute = () => {
      if (!logoRef.current || !targetRect) return false;

      const src = logoRef.current.getBoundingClientRect();
      const srcCx = src.left + src.width / 2;
      const srcCy = src.top + src.height / 2;

      const dstCx = targetRect.left + targetRect.width / 2;
      const dstCy = targetRect.top + targetRect.height / 2;

      const dx = dstCx - srcCx;
      const dy = dstCy - srcCy;

      const scale = targetRect.width / src.width;

      setFlyTransform(`translate(${dx}px, ${dy}px) scale(${scale})`);
      setLogoOpacity(1);
      return true;
    };

    let tries = 0;
    const tick = () => {
      tries += 1;
      const ok = tryCompute();
      if (!ok && tries < 20) requestAnimationFrame(tick);
      if (!ok && tries >= 20) {
        // fallback: pas de target => fade direct
        setPhase("fade");
        setTimeout(onComplete, 300);
      }
    };
    tick();

    // Après la transition, on fade l’overlay puis on termine
    const t = setTimeout(() => {
      setPhase("fade");
      setTimeout(onComplete, 350);
    }, 700);

    return () => clearTimeout(t);
  }, [phase, targetRect, onComplete]);

  return (
    <div
      className={[
        "fixed inset-0 z-50 bg-white",
        "transition-opacity duration-500",
        phase === "fade" ? "opacity-0 pointer-events-none" : "opacity-100",
      ].join(" ")}
    >
      {/* Canvas ballons */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Logo centré qui va voler vers la navbar */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={logoRef}
          className="will-change-transform"
          style={{
            width: 320,
            height: 320,
            opacity: logoOpacity,
            transform: flyTransform,
            transition:
              phase === "fly"
                ? "transform 650ms cubic-bezier(.2,.85,.2,1), opacity 650ms cubic-bezier(.2,.85,.2,1)"
                : undefined,
          }}
        >
          <img
            src={logoSrc}
            alt="Logo du club"
            className="w-full h-full object-contain drop-shadow-[0_22px_35px_rgba(0,0,0,0.18)]"
            draggable={false}
          />
        </div>
      </div>

      {/* Petit texte optionnel */}
      <div className="absolute bottom-10 inset-x-0 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-4 py-2 border border-indigo-100 text-gray-700 font-semibold shadow-sm">
          Chargement du club...
        </div>
      </div>
    </div>
  );
}
