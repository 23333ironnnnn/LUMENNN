import React, { useRef, useEffect, useCallback } from 'react';
import { useAnimation } from '../hooks/useAnimation';

// Color palette (index → color)
const COLORS = {
  0: 'transparent',
  1: '#7C5CFC',   // main body (deep purple)
  2: '#B8A9FF',   // highlight (light purple)
  3: '#000000',   // eyes (black)
  4: '#FF69B4',   // nose (pink)
};

// PIXEL_SIZE: each pixel in the array is rendered as PIXEL_SIZE×PIXEL_SIZE real pixels
const PIXEL_SIZE = 2.67; // 8 / 3 ≈ 2.67
const SPRITE_SIZE = 18; // 18×18 grid

// --- Sprite Definitions ---
// Pixel cat LUMEN

function createEmptyFrame() {
  return Array.from({ length: SPRITE_SIZE }, () =>
    Array.from({ length: SPRITE_SIZE }, () => 0)
  );
}

function setPixel(frame, x, y, color) {
  if (x >= 0 && x < SPRITE_SIZE && y >= 0 && y < SPRITE_SIZE) {
    frame[y][x] = color;
  }
}

// Build a pixel cat sprite
function buildCatFrame(earOffset = 0, tailWag = 0, eyesClosed = false, glow = false) {
  const f = createEmptyFrame();
  const bodyColor = glow ? 2 : 1;
  const xCenter = 9;
  const yStart = 4;

  // Ears (triangular)
  // Left ear
  setPixel(f, xCenter - 4 + earOffset, yStart, bodyColor);
  setPixel(f, xCenter - 3, yStart + 1, bodyColor);
  setPixel(f, xCenter - 4, yStart + 1, bodyColor);
  setPixel(f, xCenter - 5, yStart + 1, bodyColor);

  // Right ear
  setPixel(f, xCenter + 4 - earOffset, yStart, bodyColor);
  setPixel(f, xCenter + 3, yStart + 1, bodyColor);
  setPixel(f, xCenter + 4, yStart + 1, bodyColor);
  setPixel(f, xCenter + 5, yStart + 1, bodyColor);

  // Head (round shape)
  const headY = yStart + 2;
  // Top of head
  for (let x = xCenter - 3; x <= xCenter + 3; x++) {
    setPixel(f, x, headY, bodyColor);
  }
  // Middle of head (wider)
  for (let x = xCenter - 4; x <= xCenter + 4; x++) {
    setPixel(f, x, headY + 1, bodyColor);
  }
  for (let x = xCenter - 4; x <= xCenter + 4; x++) {
    setPixel(f, x, headY + 2, bodyColor);
  }
  // Lower head
  for (let x = xCenter - 3; x <= xCenter + 3; x++) {
    setPixel(f, x, headY + 3, bodyColor);
  }

  // Eyes
  if (!eyesClosed) {
    setPixel(f, xCenter - 2, headY + 1, 3); // left eye
    setPixel(f, xCenter + 2, headY + 1, 3); // right eye
  } else {
    // Closed eyes (horizontal lines)
    setPixel(f, xCenter - 2, headY + 1, 3);
    setPixel(f, xCenter - 1, headY + 1, 3);
    setPixel(f, xCenter + 1, headY + 1, 3);
    setPixel(f, xCenter + 2, headY + 1, 3);
  }

  // Nose (pink)
  setPixel(f, xCenter, headY + 2, 4);

  // Whiskers
  // Left whiskers
  setPixel(f, xCenter - 5, headY + 2, 2);
  setPixel(f, xCenter - 6, headY + 2, 2);
  // Right whiskers
  setPixel(f, xCenter + 5, headY + 2, 2);
  setPixel(f, xCenter + 6, headY + 2, 2);

  // Body
  const bodyY = headY + 4;
  for (let x = xCenter - 3; x <= xCenter + 3; x++) {
    setPixel(f, x, bodyY, bodyColor);
  }
  for (let x = xCenter - 3; x <= xCenter + 3; x++) {
    setPixel(f, x, bodyY + 1, bodyColor);
  }
  for (let x = xCenter - 2; x <= xCenter + 2; x++) {
    setPixel(f, x, bodyY + 2, bodyColor);
  }

  // Legs (four)
  // Front left
  setPixel(f, xCenter - 2, bodyY + 3, bodyColor);
  setPixel(f, xCenter - 2, bodyY + 4, bodyColor);
  // Front right
  setPixel(f, xCenter + 2, bodyY + 3, bodyColor);
  setPixel(f, xCenter + 2, bodyY + 4, bodyColor);
  // Back left
  setPixel(f, xCenter - 1, bodyY + 3, bodyColor);
  setPixel(f, xCenter - 1, bodyY + 4, bodyColor);
  // Back right
  setPixel(f, xCenter + 1, bodyY + 3, bodyColor);
  setPixel(f, xCenter + 1, bodyY + 4, bodyColor);

  // Tail (curved)
  const tailY = bodyY;
  if (tailWag === 0) {
    setPixel(f, xCenter + 4, tailY, bodyColor);
    setPixel(f, xCenter + 5, tailY - 1, bodyColor);
    setPixel(f, xCenter + 6, tailY - 2, bodyColor);
  } else if (tailWag > 0) {
    setPixel(f, xCenter + 4, tailY, bodyColor);
    setPixel(f, xCenter + 5, tailY, bodyColor);
    setPixel(f, xCenter + 6, tailY - 1, bodyColor);
  } else {
    setPixel(f, xCenter + 4, tailY, bodyColor);
    setPixel(f, xCenter + 5, tailY + 1, bodyColor);
    setPixel(f, xCenter + 6, tailY + 1, bodyColor);
  }

  return f;
}

// --- Animation Definitions ---

const ANIMATIONS = {
  idle: [
    buildCatFrame(0, 0),
    buildCatFrame(0, 1),
    buildCatFrame(0, 0),
    buildCatFrame(0, -1),
  ],
  gentle_blink: [
    buildCatFrame(0, 0, false),
    buildCatFrame(0, 0, true),
    buildCatFrame(0, 0, true),
    buildCatFrame(0, 0, false),
  ],
  eyes_half_closed: [
    buildCatFrame(0, 0, false),
    buildCatFrame(0, 1, false),
    buildCatFrame(0, 0, false),
    buildCatFrame(0, -1, false),
  ],
  slight_glow: [
    buildCatFrame(0, 0, false, true),
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 0, false, true),
    buildCatFrame(0, -1, false, true),
  ],
  tilt_head: [
    buildCatFrame(1, 0),
    buildCatFrame(1, 1),
    buildCatFrame(-1, 0),
    buildCatFrame(-1, -1),
  ],
  flicker: [
    buildCatFrame(0, 0, false, true),
    buildCatFrame(0, 0, false, false),
    buildCatFrame(0, 0, false, true),
    buildCatFrame(0, 0, false, false),
  ],
  pulse: [
    buildCatFrame(0, 0, false, false),
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 0, false, false),
    buildCatFrame(0, -1, false, true),
  ],
  // New animations
  nod: [
    buildCatFrame(0, 0),
    buildCatFrame(0, 1),
    buildCatFrame(0, 2),
    buildCatFrame(0, 1),
    buildCatFrame(0, 0),
    buildCatFrame(0, -1),
  ],
  shake: [
    buildCatFrame(2, 0),
    buildCatFrame(-2, 0),
    buildCatFrame(2, 0),
    buildCatFrame(-2, 0),
    buildCatFrame(0, 0),
  ],
  jump: [
    buildCatFrame(0, 0),
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 2, false, true),
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 0),
  ],
  happy: [
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 2, false, true),
    buildCatFrame(0, 1, false, true),
    buildCatFrame(0, 0, false, true),
  ],
  sleepy: [
    buildCatFrame(0, 0, false),
    buildCatFrame(0, 0, true),
    buildCatFrame(0, 1, true),
    buildCatFrame(0, 0, true),
    buildCatFrame(0, 0, false),
    buildCatFrame(0, -1, false),
  ],
  confused: [
    buildCatFrame(1, 0),
    buildCatFrame(-1, 0),
    buildCatFrame(1, 1),
    buildCatFrame(-1, -1),
  ],
};

function LumenCanvas({ animation = 'idle', onClick }) {
  const canvasRef = useRef(null);
  const frameIndexRef = useRef(0);
  const currentAnimRef = useRef(animation);

  // Update current animation when prop changes
  useEffect(() => {
    currentAnimRef.current = animation;
    frameIndexRef.current = 0;
  }, [animation]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const draw = useCallback((_delta, _frameCount) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get current animation frames
    const anim = ANIMATIONS[currentAnimRef.current] || ANIMATIONS.idle;
    const frames = anim;
    const frameIdx = frameIndexRef.current % frames.length;
    const frame = frames[frameIdx];

    // Draw each pixel
    for (let y = 0; y < SPRITE_SIZE; y++) {
      for (let x = 0; x < SPRITE_SIZE; x++) {
        const colorIdx = frame[y][x];
        if (colorIdx === 0) continue; // transparent
        ctx.fillStyle = COLORS[colorIdx];
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }
    }

    frameIndexRef.current += 1;
  }, []);

  useAnimation(draw, true);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_SIZE * PIXEL_SIZE}
      height={SPRITE_SIZE * PIXEL_SIZE}
      onClick={handleClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'block',
        transition: 'transform 0.1s',
      }}
      onMouseDown={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(0.95)';
      }}
      onMouseUp={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.transform = 'scale(1)';
      }}
    />
  );
}

export default LumenCanvas;
