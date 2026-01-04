'use client';

import React from 'react';

interface ActivityRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ActivityRing({
  progress,
  size = 120,
  strokeWidth = 8,
  children,
  gradientFrom = 'url(#gradient)',
  gradientTo,
}: ActivityRingProps) {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (Math.min(Math.max(progress, 0), 1) * circumference) / 1;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8D922" />
            <stop offset="100%" stopColor="#F6F6F6" />
          </linearGradient>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#A8D922" />
          </linearGradient>
          <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="100%" stopColor="#A8D922" />
          </linearGradient>
          <linearGradient id="gradient-coral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8D922" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={gradientFrom}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

interface MultiRingProps {
  rings: {
    progress: number;
    gradientId: string;
  }[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function MultiActivityRing({ rings, size = 140, strokeWidth = 10, children }: MultiRingProps) {
  const ringSpacing = strokeWidth + 4;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="ring-duration" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8D922" />
            <stop offset="100%" stopColor="#F6F6F6" />
          </linearGradient>
          <linearGradient id="ring-distance" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#A8D922" />
          </linearGradient>
          <linearGradient id="ring-workouts" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ecfccb" />
            <stop offset="100%" stopColor="#A8D922" />
          </linearGradient>
        </defs>

        {rings.map((ring, index) => {
          const radius = (size - ringSpacing * (index + 1)) / 2;
          const circumference = radius * 2 * Math.PI;
          const strokeDasharray = `${circumference} ${circumference}`;
          const strokeDashoffset = circumference - Math.min(Math.max(ring.progress, 0), 1) * circumference;

          return (
            <g key={index}>
              {/* Background circle */}
              <circle
                stroke="hsl(var(--border) / 0.3)"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
              />
              {/* Progress circle */}
              <circle
                stroke={`url(#ring-${ring.gradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                className="transition-all duration-500 ease-out"
              />
            </g>
          );
        })}
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
