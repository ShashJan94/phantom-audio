import { useState, useEffect } from "react";
import { Track } from "./MusicPlayer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Scissors } from "lucide-react";

interface AudioTrimmerProps {
  track: Track;
  onTrimUpdate: (trackId: string, trimStart: number, trimEnd: number) => void;
}

const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const AudioTrimmer = ({ track, onTrimUpdate }: AudioTrimmerProps) => {
  const [trimStart, setTrimStart] = useState(track.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(track.trimEnd || track.duration);

  useEffect(() => {
    setTrimStart(track.trimStart || 0);
    setTrimEnd(track.trimEnd || track.duration);
  }, [track]);

  const handleApply = () => {
    onTrimUpdate(track.id, trimStart, trimEnd);
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(track.duration);
    onTrimUpdate(track.id, 0, track.duration);
  };

  return (
    <div className="glass-panel rounded-xl p-6 border-neon-pink/20 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Scissors className="h-5 w-5 text-neon-pink" />
        <h3 className="text-lg font-bold text-neon-pink">Trim Track</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Start Time</Label>
            <span className="text-sm text-neon-cyan">{formatTime(trimStart)}</span>
          </div>
          <Slider
            value={[trimStart]}
            min={0}
            max={track.duration}
            step={0.1}
            onValueChange={([value]) => setTrimStart(Math.min(value, trimEnd - 1))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">End Time</Label>
            <span className="text-sm text-neon-cyan">{formatTime(trimEnd)}</span>
          </div>
          <Slider
            value={[trimEnd]}
            min={0}
            max={track.duration}
            step={0.1}
            onValueChange={([value]) => setTrimEnd(Math.max(value, trimStart + 1))}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80"
          >
            Apply Trim
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="hover:bg-destructive/20 hover:text-destructive"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
