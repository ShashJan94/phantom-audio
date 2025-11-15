import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Edit, Save, X } from "lucide-react";

interface LyricsDisplayProps {
  trackId: string | null;
  trackName: string | null;
  currentTime: number;
  lyrics?: string;
  onLyricsUpdate: (trackId: string, lyrics: string) => void;
}

export const LyricsDisplay = ({
  trackId,
  trackName,
  currentTime,
  lyrics,
  onLyricsUpdate,
}: LyricsDisplayProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState(lyrics || "");

  useEffect(() => {
    setEditedLyrics(lyrics || "");
    setIsEditing(false);
  }, [trackId, lyrics]);

  const handleSave = () => {
    if (trackId) {
      onLyricsUpdate(trackId, editedLyrics);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedLyrics(lyrics || "");
    setIsEditing(false);
  };

  if (!trackId) {
    return (
      <Card className="glass-panel border-neon-purple/20 p-8 text-center h-full flex flex-col items-center justify-center">
        <Music className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No track selected</p>
      </Card>
    );
  }

  return (
    <Card className="glass-panel border-neon-purple/20 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground truncate flex-1">
          {trackName}
        </h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="border-neon-purple/40 hover:bg-neon-purple/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Lyrics
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="border-neon-pink/40 hover:bg-neon-pink/10"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="border-neon-cyan/40 hover:bg-neon-cyan/10"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editedLyrics}
          onChange={(e) => setEditedLyrics(e.target.value)}
          placeholder="Enter lyrics here... (one line per verse)"
          className="flex-1 resize-none bg-background/50 border-neon-purple/20"
        />
      ) : (
        <ScrollArea className="flex-1">
          {lyrics ? (
            <div className="space-y-4">
              {lyrics.split("\n").map((line, index) => (
                <p
                  key={index}
                  className={`text-lg transition-all duration-300 ${
                    line.trim() === ""
                      ? "h-4"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {line || "\u00A0"}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Music className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No lyrics available</p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Click "Edit Lyrics" to add them
              </p>
            </div>
          )}
        </ScrollArea>
      )}
    </Card>
  );
};
