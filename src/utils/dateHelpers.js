// src/utils/dateHelpers.js
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    subDays,
  } from 'date-fns';
  
  export function getDaysInMonth(date) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  }
  
  export function formatMonthYear(date) {
    return format(date, 'MMMM yyyy');
  }
  
  export function formatDay(date) {
    return format(date, 'd');
  }
  
  export function getWeekday(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[getDay(date)];
  }
  
  export function getMonthKey(date) {
    return format(date, 'yyyy-MM');
  }
  
  // Local date keys
  export function getDateKey(date) {
    return format(date, 'yyyy-MM-dd');
  }
  
  export function getTodayKey() {
    return getDateKey(new Date());
  }
  
  /**
   * Map a logged sleep time to the "sleep date".
   * Example: logging at 03:00 on 24th should count as 23rd if cutoffHour = 5.
   */
  export function getSleepDateKey(now, sleepTime, cutoffHour = 5) {
    if (!sleepTime) return getDateKey(now);
  
    const [hStr] = sleepTime.split(':');
    const hour = Number(hStr ?? 0);
  
    let baseDate = now;
    if (hour < cutoffHour) {
      baseDate = subDays(now, 1);
    }
    return getDateKey(baseDate);
  }
  