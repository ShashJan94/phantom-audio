import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Playlist } from "./MusicPlayer";

interface PlaylistImportExportProps {
  playlists: Playlist[];
  onPlaylistsImport: (playlists: Playlist[]) => void;
}

export const PlaylistImportExport = ({
  playlists,
  onPlaylistsImport,
}: PlaylistImportExportProps) => {
  const exportPlaylists = () => {
    if (playlists.length === 0) {
      toast.error("No playlists to export");
      return;
    }

    const data = JSON.stringify(playlists, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `playlists-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Playlists exported successfully");
  };

  const importPlaylists = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedPlaylists = JSON.parse(text);

        if (!Array.isArray(importedPlaylists)) {
          throw new Error("Invalid playlist format");
        }

        // Validate playlist structure
        const validPlaylists = importedPlaylists.filter(
          (p) =>
            p &&
            typeof p.id === "string" &&
            typeof p.name === "string" &&
            Array.isArray(p.trackIds)
        );

        if (validPlaylists.length === 0) {
          throw new Error("No valid playlists found");
        }

        onPlaylistsImport(validPlaylists);
        toast.success(`Imported ${validPlaylists.length} playlist(s)`);
      } catch (error) {
        toast.error("Failed to import playlists");
        console.error(error);
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportPlaylists}
        variant="outline"
        size="sm"
        className="gap-2 flex-1"
        disabled={playlists.length === 0}
      >
        <Download className="w-4 h-4" />
        Export
      </Button>
      <Button
        onClick={importPlaylists}
        variant="outline"
        size="sm"
        className="gap-2 flex-1"
      >
        <Upload className="w-4 h-4" />
        Import
      </Button>
    </div>
  );
};
