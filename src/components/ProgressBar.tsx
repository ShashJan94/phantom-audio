import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  trimStart?: number;
  trimEnd?: number;
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ProgressBar = ({ currentTime, duration, onSeek, trimStart, trimEnd }: ProgressBarProps) => {
  const minTime = trimStart || 0;
  const maxTime = trimEnd || duration;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Slider
          value={[currentTime]}
          min={minTime}
          max={maxTime || 100}
          step={0.1}
          onValueChange={([value]) => onSeek(value)}
          className="cursor-pointer"
        />
        {(trimStart || trimEnd) && (
          <div className="absolute -top-1 left-0 right-0 h-3 pointer-events-none">
            {trimStart && (
              <div
                className="absolute h-full bg-destructive/30"
                style={{ left: 0, width: `${(trimStart / duration) * 100}%` }}
              />
            )}
            {trimEnd && trimEnd < duration && (
              <div
                className="absolute h-full bg-destructive/30"
                style={{ right: 0, width: `${((duration - trimEnd) / duration) * 100}%` }}
              />
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(maxTime)}</span>
      </div>
    </div>
  );
};
