import { Track } from "./MusicPlayer";
import { Button } from "@/components/ui/button";
import { Music, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  onTrackSelect: (track: Track) => void;
  onTrackRemove: (id: string) => void;
}

export const TrackList = ({
  tracks,
  currentTrack,
  onTrackSelect,
  onTrackRemove,
}: TrackListProps) => {
  return (
    <div className="glass-panel rounded-xl p-6 border-neon-pink/20 h-full">
      <h3 className="text-xl font-bold mb-4 text-neon-pink">Queue</h3>
      
      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Music className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground">No tracks in queue</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Drop some music files to get started
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  currentTrack?.id === track.id
                    ? "bg-primary/20 border border-primary/50 neon-glow-cyan"
                    : "bg-card hover:bg-card/80 border border-transparent hover:border-border"
                }`}
                onClick={() => onTrackSelect(track)}
              >
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center ${
                    currentTrack?.id === track.id ? "animate-pulse-glow" : ""
                  }`}>
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {track.name}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackRemove(track.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
