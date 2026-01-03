'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: number; // percentage change, positive or negative
    period?: string; // e.g., "vs last week"
  };
  icon?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function StatsCard({
  label,
  value,
  unit,
  trend,
  icon,
  className,
  gradient = false,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    if (trend.value > 0) return 'text-green-500';
    if (trend.value < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md',
        gradient && 'bg-gradient-to-br from-card to-card/80',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatValue(value)}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-xs', getTrendColor())}>
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
              {trend.period && <span className="text-muted-foreground"> {trend.period}</span>}
            </div>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

// Mini version for compact displays
interface StatsCardMiniProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function StatsCardMini({ label, value, unit, className }: StatsCardMiniProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={cn('rounded-lg border border-border bg-card p-3', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-semibold">{formatValue(value)}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
