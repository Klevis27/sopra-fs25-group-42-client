"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Ball {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  w: number;
  h: number;
  img: string;
  angle: number;
  da: number;
}

const IMG_META: { src: string; w: number; h: number }[] = [
  { src: "/d-removebg-preview.png", w: 90, h: 110 },
  { src: "/m-removebg-preview.png", w: 100, h: 90 },
  { src: "/n-removebg-preview.png", w: 82, h: 95 },
];

const rand = (a: number, b: number) => Math.random() * (b - a) + a;

const MovingLetters: React.FC = () => {
  const [balls, setBalls] = useState<Ball[]>([]);
  const raf = useRef<number | null>(null);

  /* ------------------------------------------------------------------
     1.  Place the three letter‑images on first mount
  ------------------------------------------------------------------ */
  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const placed: Ball[] = [];

    IMG_META.forEach(({ src, w, h }, i) => {
      const r = Math.max(w, h) / 2;
      let x = 0;
      let y = 0;
      let ok = false;

      while (!ok) {
        x = rand(r, W - r);
        y = rand(r, H - r);
        ok = placed.every(
          (b) => Math.hypot(b.x - x, b.y - y) > Math.max(b.w, b.h) / 2 + r + 10
        );
      }

      placed.push({
        id: i,
        x,
        y,
        dx: rand(-3, 3) || 2, // ensure non‑zero
        dy: rand(-3, 3) || 2,
        w,
        h,
        img: src,
        angle: rand(0, 360),
        da: rand(-2, 2) || 1,
      });
    });

    setBalls(placed);
  }, []);

  /* ------------------------------------------------------------------
     2.  Animation loop
  ------------------------------------------------------------------ */
  useEffect(() => {
    const step = () => {
      setBalls((prev) => {
        const W = window.innerWidth;
        const H = window.innerHeight;

        /* --- move every ball --- */
        const next = prev.map((b) => {
          const { x: oldX, y: oldY, dx: oldDx, dy: oldDy, w, h, angle: oldAngle, da } =
            b;

          let x = oldX + oldDx;
          let y = oldY + oldDy;
          let dx = oldDx;
          let dy = oldDy;
          const angle = (oldAngle + da) % 360; // <‑‑ const fixes the ESLint error

          const w2 = w / 2;
          const h2 = h / 2;

          // collide with walls
          if (x + w2 > W) {
            x = W - w2;
            dx = -dx;
          } else if (x - w2 < 0) {
            x = w2;
            dx = -dx;
          }
          if (y + h2 > H) {
            y = H - h2;
            dy = -dy;
          } else if (y - h2 < 0) {
            y = h2;
            dy = -dy;
          }

          return { ...b, x, y, dx, dy, angle };
        });

        /* --- simple elastic collision between any two balls --- */
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const b1 = next[i];
            const b2 = next[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy);
            const min = Math.max(b1.w, b1.h) / 2 + Math.max(b2.w, b2.h) / 2;

            if (dist < min) {
              // push apart
              const nx = dx / dist;
              const ny = dy / dist;
              const overlap = (min - dist) / 2;
              b1.x -= nx * overlap;
              b1.y -= ny * overlap;
              b2.x += nx * overlap;
              b2.y += ny * overlap;

              // swap velocity in normal direction (equal mass)
              const kx = b1.dx - b2.dx;
              const ky = b1.dy - b2.dy;
              const p = 2 * (nx * kx + ny * ky) / 2;
              b1.dx -= p * nx;
              b1.dy -= p * ny;
              b2.dx += p * nx;
              b2.dy += p * ny;
            }
          }
        }

        return [...next];
      });

      raf.current = requestAnimationFrame(step);
    };

    raf.current = requestAnimationFrame(step);

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  /* ------------------------------------------------------------------
     3.  Render
  ------------------------------------------------------------------ */
  return (
    <>
      {balls.map((b) => (
        <div
          key={b.id}
          style={{
            position: "fixed",
            left: `${b.x - b.w / 2}px`,
            top: `${b.y - b.h / 2}px`,
            width: `${b.w}px`,
            height: `${b.h}px`,
            transform: `rotate(${b.angle}deg)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <Image
            src={b.img}
            alt=""
            width={b.w}
            height={b.h}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      ))}
    </>
  );
};

export default MovingLetters;