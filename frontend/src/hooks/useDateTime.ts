import { useCallback } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

// Extend dayjs with duration plugin
dayjs.extend(duration);

type TimeFormat = "hh:mm:ss" | "mm:ss" | "h:m:s" | "m:s";

interface UseDateTimeReturn {
  formatDurationToTime: (ms: number, format?: TimeFormat) => string;
}

export const useDateTime = (): UseDateTimeReturn => {
  const formatDurationToTime = useCallback((ms: number, format: TimeFormat = "hh:mm:ss"): string => {
    const duration = dayjs.duration(ms);
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    switch (format) {
      case "hh:mm:ss":
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case "mm:ss":
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      case "h:m:s":
        return `${hours}:${minutes}:${seconds.toString().padStart(2, '0')}`;
      case "m:s":
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      default:
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }, []);

  return {
    formatDurationToTime,
  };
};
