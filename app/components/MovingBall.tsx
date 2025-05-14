"use client";
import React, { useEffect, useRef, useState } from "react";

const MovingBall: React.FC = () => {
  const ballRef = useRef<HTMLImageElement>(null);
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

        let newX = prevPos.x + velocity.x;
        let newY = prevPos.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        if (newX <= 0 || newX + ballWidth >= screenWidth) {
          newVelocityX = -newVelocityX;
        }
        if (newY <= 0 || newY + ballHeight >= screenHeight) {
          newVelocityY = -newVelocityY;
        }

        setVelocity({ x: newVelocityX, y: newVelocityY });
        return { x: newX, y: newY };
      });

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [velocity]);

  return (
    <img
      ref={ballRef}
      src="/logo.png"
      alt="Moving Ball"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: "190px",     
        height: "190px",    
        opacity: 1,        
        zIndex: 0,         
        pointerEvents: "none",
        animation: "spin 4s linear infinite",
      }}
    />
  );
};

export default MovingBall;