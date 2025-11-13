import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, List, Trash2 } from "lucide-react";
import { Track, Playlist } from "./MusicPlayer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PlaylistManagerProps {
  playlists: Playlist[];
  tracks: Track[];
  currentPlaylist: string | null;
  onPlaylistCreate: (name: string) => void;
  onPlaylistSelect: (id: string | null) => void;
  onPlaylistDelete: (id: string) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PlaylistManager = ({
  playlists,
  currentPlaylist,
  onPlaylistCreate,
  onPlaylistSelect,
  onPlaylistDelete,
}: PlaylistManagerProps) => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      onPlaylistCreate(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 border-neon-purple/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-neon-purple">Playlists</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel">
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Give your playlist a name
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} className="w-full">
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-2">
          <div
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              !currentPlaylist
                ? "bg-primary/20 border border-primary/50"
                : "bg-card hover:bg-card/80 border border-transparent hover:border-border"
            }`}
            onClick={() => onPlaylistSelect(null)}
          >
            <List className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium flex-1">All Tracks</span>
          </div>

          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                currentPlaylist === playlist.id
                  ? "bg-primary/20 border border-primary/50 neon-glow-cyan"
                  : "bg-card hover:bg-card/80 border border-transparent hover:border-border"
              }`}
            >
              <List className="h-4 w-4 text-primary" />
              <span
                className="text-sm font-medium flex-1 truncate"
                onClick={() => onPlaylistSelect(playlist.id)}
              >
                {playlist.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaylistDelete(playlist.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
