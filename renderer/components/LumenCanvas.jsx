import React, { useRef, useEffect, useCallback } from 'react';
import { useAnimation } from '../hooks/useAnimation';

// Color palette (index → color)
const COLORS = {
  0: 'transparent',
  1: '#7C5CFC',   // main body (deep purple)
  2: '#B8A9FF',   // highlight (light purple)
  3: '#E0E0FF',   // eyes (lavender white)
  4: '#1A1A2E',   // dark (background accent)
};

// PIXEL_SIZE: each pixel in the array is rendered as PIXEL_SIZE×PIXEL_SIZE real pixels
const PIXEL_SIZE = 8;
const SPRITE_SIZE = 18; // 18×18 grid

// --- Sprite Definitions ---
// Each animation is an array of frames.
// Each frame is an 18×18 array of color indices.

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

// Build a LUMEN body shape (rounded top, flowing tail)
function buildBodyFrame(eyeOpen = true, eyeOffsetX = 0, bodyOffsetY = 0, glow = false) {
  const f = createEmptyFrame();
  const bodyColor = glow ? 2 : 1; // highlight when glowing
  const highlightColor = glow ? 1 : 2;

  // Head (rounded dome)
  for (let y = 2 + bodyOffsetY; y <= 8 + bodyOffsetY; y++) {
    const rowWidth = y <= 4 + bodyOffsetY ? 3 : 4;
    const xCenter = 9;
    for (let x = -rowWidth; x <= rowWidth; x++) {
      setPixel(f, xCenter + x, y, y <= 4 + bodyOffsetY ? bodyColor : highlightColor);
    }
  }

  // Body tapering down
  for (let y = 9 + bodyOffsetY; y <= 14 + bodyOffsetY; y++) {
    const rowWidth = Math.max(1, 5 - (y - 9 - bodyOffsetY));
    const xCenter = 9;
    const color = (y + bodyOffsetY) % 2 === 0 ? bodyColor : highlightColor;
    for (let x = -rowWidth; x <= rowWidth; x++) {
      setPixel(f, xCenter + x, y, color);
    }
  }

  // Flowing tail (bottom)
  const tailColors = [1, 2, 1, 0];
  for (let i = 0; i < 4; i++) {
    const y = 15 + bodyOffsetY + i;
    const offset = Math.floor(i / 2);
    setPixel(f, 9 + offset, y, tailColors[i]);
    setPixel(f, 9 - offset, y, tailColors[i]);
  }

  // Eyes
  if (eyeOpen) {
    const eyeY = 5 + bodyOffsetY;
    setPixel(f, 7 + eyeOffsetX, eyeY, 3);     // left eye
    setPixel(f, 11 + eyeOffsetX, eyeY, 3);    // right eye
    setPixel(f, 7 + eyeOffsetX, eyeY + 1, 3); // left eye lower
    setPixel(f, 11 + eyeOffsetX, eyeY + 1, 3);// right eye lower
  } else {
    // Closed eyes (thin line)
    const eyeY = 6 + bodyOffsetY;
    setPixel(f, 7 + eyeOffsetX, eyeY, 3);
    setPixel(f, 11 + eyeOffsetX, eyeY, 3);
  }

  return f;
}

// --- Animation Definitions ---

const ANIMATIONS = {
  idle: [
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(true, 0, -1),
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(true, 0, 1),
  ],
  gentle_blink: [
    buildBodyFrame(true, 0, 0),
    buildBodyFrame(false, 0, 0),
    buildBodyFrame(false, 0, 0),
    buildBodyFrame(true, 0, 0),
  ],
  eyes_half_closed: [
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 1, false),
    buildBodyFrame(false, 0, 0, false),
    buildBodyFrame(false, 0, 0, false),
  ],
  slight_glow: [
    buildBodyFrame(true, 0, -1, true),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 1, true),
    buildBodyFrame(true, 0, 0, true),
  ],
  tilt_head: [
    buildBodyFrame(true, 1, 0),
    buildBodyFrame(true, 1, 0),
    buildBodyFrame(true, -1, 0),
    buildBodyFrame(true, -1, 0),
  ],
  flicker: [
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
  ],
  pulse: [
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
    buildBodyFrame(true, 0, 0, false),
    buildBodyFrame(true, 0, 0, true),
  ],
};

function LumenCanvas({ animation = 'idle' }) {
  const canvasRef = useRef(null);
  const frameIndexRef = useRef(0);
  const currentAnimRef = useRef(animation);

  // Update current animation when prop changes
  useEffect(() => {
    currentAnimRef.current = animation;
    frameIndexRef.current = 0;
  }, [animation]);

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
      style={{ cursor: 'pointer', display: 'block' }}
    />
  );
}

export default LumenCanvas;
