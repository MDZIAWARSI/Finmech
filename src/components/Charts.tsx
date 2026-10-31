'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PieSlice {
  label: string;
  amount: number;
  percentage: number;
  color?: string;
}

interface SpendingPieChartProps {
  slices: PieSlice[];
  totalAmount: number;
  currency?: string;
  onSelectCategory?: (category: string) => void;
}

// Minimalist monochrome & accent color palette for pie chart slices
const MONO_PALETTE = [
  '#111111', // Deep Stark Black
  '#404040', // Neutral Charcoal
  '#737373', // Mid Zinc
  '#a3a3a3', // Light Gray
  '#10b981', // Subtle Emerald (Savings / High value)
  '#6366f1', // Indigo hint
  '#e5e5e5', // Border tone
];

const MONO_DARK_PALETTE = [
  '#ffffff', // Pure White
  '#d4d4d8', // Light Zinc
  '#a1a1aa', // Medium Zinc
  '#71717a', // Deep Zinc
  '#10b981', // Emerald
  '#818cf8', // Indigo
  '#3f3f46', // Dark Charcoal
];

export function SpendingPieChart({
  slices,
  totalAmount,
  currency = '₹',
  onSelectCategory,
}: SpendingPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (slices.length === 0 || totalAmount <= 0) {
    return (
      <div className="py-8 text-center text-xs text-neutral-400">
        No expense data to graph yet.
      </div>
    );
  }

  // Calculate SVG Pie/Donut paths
  // Radius = 65, Inner Radius = 45 (Donut)
  const size = 180;
  const center = size / 2;
  const outerRadius = 70;
  const innerRadius = 50;

  let cumulativeAngle = -90; // Start at 12 o'clock

  const slicePaths = slices.map((slice, index) => {
    const angle = (slice.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + Math.max(1, angle);
    cumulativeAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);

    const x3 = center + innerRadius * Math.cos(endRad);
    const y3 = center + innerRadius * Math.sin(endRad);
    const x4 = center + innerRadius * Math.cos(startRad);
    const y4 = center + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...slice,
      pathData,
      color: MONO_PALETTE[index % MONO_PALETTE.length],
      darkColor: MONO_DARK_PALETTE[index % MONO_DARK_PALETTE.length],
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="space-y-4">
      {/* Chart and Center Readout */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform transition-transform duration-300"
          >
            {slicePaths.map((slice, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <path
                  key={slice.label}
                  d={slice.pathData}
                  className="transition-all duration-200 cursor-pointer fill-neutral-800 dark:fill-neutral-200 hover:opacity-80"
                  style={{
                    fill: slice.color,
                    transformOrigin: `${center}px ${center}px`,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onSelectCategory && onSelectCategory(slice.label)}
                />
              );
            })}
          </svg>

          {/* Center Text in Donut Hole */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
              {activeSlice ? activeSlice.label : 'Total Spend'}
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {currency}
              {(activeSlice ? activeSlice.amount : totalAmount).toLocaleString('en-IN')}
            </span>
            {activeSlice && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeSlice.percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>

        {/* Minimalist Legend beside or below */}
        <div className="flex-1 w-full max-w-xs space-y-2">
          {slicePaths.slice(0, 5).map((slice, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <button
                key={slice.label}
                type="button"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectCategory && onSelectCategory(slice.label)}
                className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors text-left ${
                  isHovered
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate font-medium">{slice.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 tabular-nums font-semibold text-neutral-900 dark:text-white">
                  <span>{currency}{slice.amount.toLocaleString()}</span>
                  <span className="text-[10px] text-neutral-400 font-normal w-7 text-right">
                    {slice.percentage.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TrendPoint {
  day: string;
  amount: number;
}

interface SpendingTrendGraphProps {
  data: TrendPoint[];
  currency?: string;
  title?: string;
}

export function SpendingTrendGraph({
  data,
  currency = '₹',
  title = 'Spend Velocity',
}: SpendingTrendGraphProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.amount), 100);
  const width = 360;
  const height = 120;
  const paddingX = 20;
  const paddingY = 15;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (d.amount / maxVal) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlX = (current.x + next.x) / 2;
    pathD += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
  }

  // Fill path closing at bottom
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="space-y-2">
      {/* Header with Title and Current Hover Value */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">
          {title}
        </span>
        <span className="font-bold text-neutral-900 dark:text-white tabular-nums">
          {hoveredPoint ? (
            <span>
              {hoveredPoint.day}: <strong className="text-emerald-500">{currency}{hoveredPoint.amount.toLocaleString()}</strong>
            </span>
          ) : (
            <span className="text-neutral-400 font-normal">Last {data.length} periods</span>
          )}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill under curve */}
          <path
            d={fillD}
            className="text-neutral-900 dark:text-white"
            fill="url(#trendGradient)"
          />

          {/* Line curve */}
          <path
            d={pathD}
            fill="none"
            className="stroke-neutral-900 dark:stroke-white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {points.map((pt) => {
            const isHovered = hoveredPoint?.day === pt.day;
            return (
              <g key={pt.day} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5 : 3}
                  className={`transition-all ${
                    isHovered
                      ? 'fill-emerald-500 stroke-white dark:stroke-black stroke-2'
                      : 'fill-neutral-900 dark:fill-white'
                  }`}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-[10px] text-neutral-400 px-3 pt-1">
          {data.map((d, i) => (
            <span key={d.day} className={i % 2 === 0 ? 'block' : 'hidden sm:block'}>
              {d.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
