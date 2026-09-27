import React, { useEffect, useRef } from 'react';

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.01 + 0.003,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 3, 50, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#0a142e');
      bgGrad.addColorStop(0.5, '#050a18');
      bgGrad.addColorStop(1, '#02050e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0.2) s.speed = -s.speed;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 230, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`;
        ctx.shadowBlur = s.r > 1.2 ? 6 : 0;
        ctx.shadowColor = '#00f0ff';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
