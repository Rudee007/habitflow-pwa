// src/components/ActivityRing.jsx
import React from 'react';
import { cn } from '../utils/cn';

function ActivityRing({ 
  percentage = 0, 
  color = { start: '#92E82A', end: '#3CD27C' },
  size = 120,
  strokeWidth = 12,
  label,
  value,
  className 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 0 8px rgba(146, 232, 42, 0.3))' }}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2C2C2E"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.start} />
              <stop offset="100%" stopColor={color.end} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {Math.round(percentage)}%
          </span>
          {value && (
            <span className="text-xs text-gray-400 mt-1">{value}</span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-sm text-gray-300 font-medium">{label}</span>
      )}
    </div>
  );
}

export default ActivityRing;
