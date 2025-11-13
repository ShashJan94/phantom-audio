import { useCallback } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileDropzone = ({ onFilesAdded }: FileDropzoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("audio/")
      );

      if (files.length === 0) {
        toast.error("Please drop audio files only");
        return;
      }

      onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("audio/")
      );

      if (files.length === 0) {
        toast.error("Please select audio files only");
        return;
      }

      onFilesAdded(files);
      e.target.value = "";
    },
    [onFilesAdded]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="glass-panel rounded-xl p-12 border-2 border-dashed border-neon-purple/30 hover:border-neon-purple/60 transition-all cursor-pointer group relative overflow-hidden"
    >
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="text-center space-y-4 relative z-0">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 group-hover:from-neon-cyan/30 group-hover:to-neon-purple/30 transition-all group-hover:scale-110">
          <Upload className="h-10 w-10 text-neon-purple" />
        </div>
        
        <div>
          <p className="text-lg font-semibold text-foreground mb-2">
            Drop your music here
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground/70">
          Supports MP3, WAV, FLAC, OGG, M4A and more
        </p>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-neon-purple/5 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};
