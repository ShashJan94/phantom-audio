import { Track, Playlist } from "./MusicPlayer";
import { Button } from "@/components/ui/button";
import { Music, X, GripVertical, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackListProps {
  tracks: Track[];
  allTracks: Track[];
  currentTrack: Track | null;
  playlists: Playlist[];
  currentPlaylist: string | null;
  onTrackSelect: (track: Track) => void;
  onTrackRemove: (id: string) => void;
  onReorder: (tracks: Track[]) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
}

function SortableTrackItem({
  track,
  currentTrack,
  playlists,
  onTrackSelect,
  onTrackRemove,
  onAddToPlaylist,
}: {
  track: Track;
  currentTrack: Track | null;
  playlists: Playlist[];
  onTrackSelect: (track: Track) => void;
  onTrackRemove: (id: string) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: track.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
        currentTrack?.id === track.id
          ? "bg-primary/20 border border-primary/50 neon-glow-cyan"
          : "bg-card hover:bg-card/80 border border-transparent hover:border-border"
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        onClick={() => onTrackSelect(track)}
      >
        <div className="flex-shrink-0">
          <div
            className={`h-10 w-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center ${
              currentTrack?.id === track.id ? "animate-pulse-glow" : ""
            }`}
          >
            <Music className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{track.name}</p>
          {(track.trimStart || track.trimEnd) && (
            <p className="text-xs text-neon-cyan">Trimmed</p>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass-panel">
          {playlists.map((playlist) => (
            <DropdownMenuItem
              key={playlist.id}
              onClick={() => onAddToPlaylist(playlist.id, track.id)}
            >
              Add to {playlist.name}
            </DropdownMenuItem>
          ))}
          {playlists.length === 0 && (
            <DropdownMenuItem disabled>No playlists available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onTrackRemove(track.id);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export const TrackList = ({
  tracks,
  allTracks,
  currentTrack,
  playlists,
  currentPlaylist,
  onTrackSelect,
  onTrackRemove,
  onReorder,
  onAddToPlaylist,
}: TrackListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);

      if (!currentPlaylist) {
        // Reordering all tracks
        const newTracks = arrayMove(tracks, oldIndex, newIndex);
        onReorder(newTracks);
      }
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 border-neon-pink/20 h-full">
      <h3 className="text-xl font-bold mb-4 text-neon-pink">
        {currentPlaylist ? "Playlist Queue" : "Queue"}
      </h3>

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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {tracks.map((track) => (
                  <SortableTrackItem
                    key={track.id}
                    track={track}
                    currentTrack={currentTrack}
                    playlists={playlists}
                    onTrackSelect={onTrackSelect}
                    onTrackRemove={onTrackRemove}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </ScrollArea>
      )}
    </div>
  );
};
