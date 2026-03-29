import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatRelativeTime = (dateInput) => {
  const date = new Date(dateInput);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, 'MMM d, yyyy');
}

export const getMoodEmoji = (mood_tag) => {
  const map = {
    HAPPY: '😊',
    CALM: '🙂',
    ANXIOUS: '😐',
    SAD: '😔',
    ANGRY: '😞',
  }
  return map[mood_tag] || '😶';
}

export const getMoodColor = (mood_tag) => {
  const map = {
    HAPPY: 'text-accent-green',
    CALM: 'text-accent-blue',
    ANXIOUS: 'text-accent-amber',
    SAD: 'text-text-muted',
    ANGRY: 'text-accent-red',
  }
  return map[mood_tag] || 'text-text-muted';
}
