'use client';

import React, { useEffect, useState } from 'react';
import { Category } from '@/types';

interface CategoryTimeBadgeProps {
  category?: Pick<Category, 'startTime' | 'endTime'> | null;
  variant?: 'light' | 'dark' | 'accent';
  className?: string;
}

const MINUTES_IN_DAY = 24 * 60;

function parseTime(value?: string) {
  if (!value) return null;

  const [hoursValue, minutesValue] = value.split(':');
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export const CategoryTimeBadge: React.FC<CategoryTimeBadgeProps> = ({ category, variant = 'light', className }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startMinutes = parseTime(category?.startTime);
  const endMinutes = parseTime(category?.endTime);

  if (startMinutes === null || endMinutes === null) return null;
  if (startMinutes === 0 && endMinutes === 0) return null;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = currentMinutes * 60 + now.getSeconds();
  const startSeconds = startMinutes * 60;
  const endSeconds = endMinutes * 60;

  const overnight = endMinutes <= startMinutes;
  const inWindow = overnight
    ? currentMinutes >= startMinutes || currentMinutes < endMinutes
    : currentMinutes >= startMinutes && currentMinutes < endMinutes;

  const remainingSeconds = inWindow
    ? (overnight && currentSeconds < endSeconds
        ? endSeconds + MINUTES_IN_DAY * 60 - currentSeconds
        : endSeconds - currentSeconds)
    : (currentMinutes < startMinutes
        ? startSeconds - currentSeconds
        : startSeconds + MINUTES_IN_DAY * 60 - currentSeconds);

  const status = inWindow ? 'Closes in' : 'Opens in';

  const baseClassName = variant === 'dark'
    ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_0_1px_rgba(250,204,21,0.35)]'
    : variant === 'accent'
      ? 'bg-yellow-400 text-black border-yellow-500 shadow-[0_0_0_1px_rgba(250,204,21,0.25)]'
      : 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_0_1px_rgba(250,204,21,0.2)]';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] md:text-[10px] font-black uppercase tracking-[0.14em] font-mono shrink-0 leading-none whitespace-nowrap',
        baseClassName,
        className ?? '',
      ].join(' ')}
    >
      <span>{status}</span>
      <span>{formatDuration(remainingSeconds)}</span>
    </span>
  );
};