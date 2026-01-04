'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface WeeklyDataPoint {
  date: string; // ISO date
  duration: number; // minutes
  distance: number; // km
  workoutCount: number;
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[];
  metric: 'duration' | 'distance' | 'workoutCount';
  className?: string;
  type?: 'bar' | 'line';
  height?: number;
}

export function WeeklyChart({
  data,
  metric,
  className,
  type = 'bar',
  height = 120,
}: WeeklyChartProps) {
  const maxValue = Math.max(...data.map((d) => d[metric]), 1);
  const minValue = Math.min(...data.map((d) => d[metric]), 0);

  const getMetricLabel = () => {
    switch (metric) {
      case 'duration':
        return 'Duration';
      case 'distance':
        return 'Distance';
      case 'workoutCount':
        return 'Workouts';
    }
  };

  const getMetricUnit = () => {
    switch (metric) {
      case 'duration':
        return 'min';
      case 'distance':
        return 'km';
      case 'workoutCount':
        return '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-32 items-center justify-center text-sm text-muted-foreground', className)}>
        No data available
      </div>
    );
  }

  if (type === 'line') {
    return <LineChart data={data} metric={metric} height={height} className={className} />;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">{getMetricLabel()}</h3>
        <span className="text-xs text-muted-foreground">{getMetricUnit()}</span>
      </div>

      <div
        className="flex items-end justify-between gap-1"
        style={{ height: `${height}px` }}
      >
        {data.map((point, index) => {
          const value = point[metric];
          const heightPercent = ((value - minValue) / (maxValue - minValue || 1)) * 100;
          const isToday = isDateToday(point.date);

          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all duration-300',
                  'bg-primary',
                  isToday && 'opacity-80'
                )}
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                title={`${formatDate(point.date)}: ${value} ${getMetricUnit()}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

interface LineChartProps {
  data: WeeklyDataPoint[];
  metric: 'duration' | 'distance' | 'workoutCount';
  height: number;
  className?: string;
}

function LineChart({ data, metric, height, className }: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d[metric]), 1);
  const minValue = Math.min(...data.map((d) => d[metric]), 0);

  const points = data.map((point, index) => {
    const value = point[metric];
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((value - minValue) / (maxValue - minValue || 1)) * 100;
    return { x, y, value, date: point.date };
  });

  const pathD = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `L ${point.x} ${point.y}`;
    })
    .join(' ');

  const gradientAreaPath = `${pathD} L 100 100 L 0 100 Z`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A8D922" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A8D922" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={gradientAreaPath} fill="url(#lineGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#A8D922"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => {
          const isToday = isDateToday(point.date);
          return (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={isToday ? '3' : '2'}
              fill={isToday ? '#E5F880' : '#A8D922'}
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(data[0].date)}</span>
        <span>{formatDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

function isDateToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Combined chart showing multiple metrics
interface MultiMetricChartProps {
  data: WeeklyDataPoint[];
  className?: string;
  height?: number;
}

export function MultiMetricChart({ data, className, height = 180 }: MultiMetricChartProps) {
  const maxDuration = Math.max(...data.map((d) => d.duration), 1);
  const maxDistance = Math.max(...data.map((d) => d.distance), 1);
  const maxWorkouts = Math.max(...data.map((d) => d.workoutCount), 1);

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-foreground">Weekly Activity</h3>

      <div style={{ height: `${height}px` }} className="relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="border-b border-dashed border-border/30" />
          <div className="border-b border-dashed border-border/30" />
          <div className="border-b border-dashed border-border/30" />
          <div className="border-b border-dashed border-border/30" />
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-1">
          {data.map((point, index) => {
            const durationHeight = (point.duration / maxDuration) * 100;
            const distanceHeight = (point.distance / maxDistance) * 100;
            const isToday = isDateToday(point.date);

            return (
              <div key={index} className="flex flex-1 flex-col gap-1">
                {/* Duration bar */}
                <div
                  className={cn(
                    'w-full rounded-t-sm bg-[#A8D922] transition-all duration-300',
                    isToday && 'opacity-80'
                  )}
                  style={{ height: `${durationHeight * 0.45}%` }}
                  title={`${point.duration} min`}
                />
                {/* Distance bar - use darker lime/green */}
                <div
                  className="w-full rounded-t-sm bg-[#84cc16] transition-all duration-300"
                  style={{ height: `${distanceHeight * 0.45}%` }}
                  title={`${point.distance} km`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded bg-[#A8D922]" />
          <span>Duration</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded bg-[#84cc16]" />
          <span>Distance</span>
        </div>
      </div>
    </div>
  );
}
