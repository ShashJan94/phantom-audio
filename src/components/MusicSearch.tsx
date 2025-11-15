import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, Play, Download, Music, Loader2 } from "lucide-react";

interface SearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
}

interface MusicSearchProps {
  onPlayTrack: (url: string, name: string) => void;
}

export const MusicSearch = ({ onPlayTrack }: MusicSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null);

  const searchMusic = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      // Using iTunes Search API (free, no API key needed)
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&media=music&entity=song&limit=20`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        toast.success(`Found ${data.results.length} tracks`);
      } else {
        toast.info("No results found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for music");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchMusic();
    }
  };

  const playPreview = async (track: SearchResult) => {
    if (!track.previewUrl) {
      toast.error("No preview available for this track");
      return;
    }

    setSelectedTrack(track.trackId);
    onPlayTrack(track.previewUrl, `${track.trackName} - ${track.artistName}`);
    toast.success(`Playing: ${track.trackName}`);
  };

  const downloadPreview = async (track: SearchResult) => {
    if (!track.previewUrl) {
      toast.error("No preview available for download");
      return;
    }

    try {
      const response = await fetch(track.previewUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.trackName} - ${track.artistName}.m4a`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download track");
    }
  };

  const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="glass-panel border-neon-pink/20 p-6 h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
        Music Search
      </h3>

      <div className="flex gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for music..."
          className="flex-1 border-neon-pink/20"
          disabled={isSearching}
        />
        <Button
          onClick={searchMusic}
          disabled={isSearching}
          className="bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90"
        >
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((track) => (
              <Card
                key={track.trackId}
                className={`p-4 transition-all cursor-pointer hover:bg-neon-pink/5 ${
                  selectedTrack === track.trackId
                    ? "border-neon-pink bg-neon-pink/10"
                    : "border-neon-pink/20"
                }`}
              >
                <div className="flex gap-4">
                  <img
                    src={track.artworkUrl100}
                    alt={track.trackName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {track.trackName}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artistName}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate">
                      {track.collectionName}
                    </p>
                    <p className="text-xs text-neon-pink mt-1">
                      {formatDuration(track.trackTimeMillis)} • Preview (30s)
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playPreview(track)}
                      className="border-neon-pink/40 hover:bg-neon-pink/10"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPreview(track)}
                      className="border-neon-cyan/40 hover:bg-neon-cyan/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Music className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isSearching ? "Searching..." : "Search for music to get started"}
            </p>
            <p className="text-sm text-muted-foreground/60 mt-2">
              Find tracks from millions of songs
            </p>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
