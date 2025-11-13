import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  disabled?: boolean;
}

export const PlaybackControls = ({
  isPlaying,
  isShuffled,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onShuffleToggle,
  onRepeatToggle,
  disabled,
}: PlaybackControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onShuffleToggle}
        disabled={disabled}
        className={`hover:bg-primary/20 transition-all ${
          isShuffled ? "text-primary neon-glow-cyan" : "text-muted-foreground"
        }`}
      >
        <Shuffle className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
        className="hover:bg-primary/20 text-foreground transition-all hover:scale-110"
      >
        <SkipBack className="h-5 w-5" />
      </Button>

      <Button
        size="icon"
        onClick={onPlayPause}
        disabled={disabled}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-cyan/80 hover:to-neon-purple/80 neon-glow-cyan transition-all hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="h-6 w-6 text-background" />
        ) : (
          <Play className="h-6 w-6 text-background ml-0.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={disabled}
        className="hover:bg-primary/20 text-foreground transition-all hover:scale-110"
      >
        <SkipForward className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRepeatToggle}
        disabled={disabled}
        className={`hover:bg-primary/20 transition-all ${
          repeatMode !== "off" ? "text-primary neon-glow-cyan" : "text-muted-foreground"
        }`}
      >
        {repeatMode === "one" ? (
          <Repeat1 className="h-5 w-5" />
        ) : (
          <Repeat className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};
