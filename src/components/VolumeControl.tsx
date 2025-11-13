import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

export const VolumeControl = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) => {
  return (
    <div className="flex items-center gap-2 w-32">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className="hover:bg-primary/20 text-foreground"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <div className="flex-1 cursor-pointer">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={([value]) => onVolumeChange(value / 100)}
              className="cursor-pointer"
            />
          </div>
        </PopoverTrigger>
      </Popover>
    </div>
  );
};
