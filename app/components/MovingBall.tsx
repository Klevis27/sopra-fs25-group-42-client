"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const MovingBall: React.FC = () => {
  const ballRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState({ x: 2, y: 2 });

  useEffect(() => {
    let animationFrameId: number;

    const updatePosition = () => {
      setPosition((prevPos) => {
        const ball = ballRef.current;
        if (!ball) return prevPos;

        const ballWidth = ball.offsetWidth;
        const ballHeight = ball.offsetHeight;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const nextX = prevPos.x + velocity.x;
        const nextY = prevPos.y + velocity.y;

        let nextVelocityX = velocity.x;
        let nextVelocityY = velocity.y;

        if (nextX <= 0 || nextX + ballWidth >= screenWidth) {
          nextVelocityX = -velocity.x;
        }
        if (nextY <= 0 || nextY + ballHeight >= screenHeight) {
          nextVelocityY = -velocity.y;
        }

        if (nextVelocityX !== velocity.x || nextVelocityY !== velocity.y) {
          setVelocity({ x: nextVelocityX, y: nextVelocityY });
        }

        return { x: nextX, y: nextY };
      });

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [velocity]);

  return (
    <div
      ref={ballRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: "190px",
        height: "190px",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Image
        //src="/logo.png"
        src="/palestinaflag.jpeg"
        alt="Moving Ball"
        width={190}
        height={190}
        style={{
          animation: "spin 4s linear infinite",
        }}
      />
    </div>
  );
};

export default MovingBall;