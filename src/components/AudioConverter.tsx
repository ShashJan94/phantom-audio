import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "./FileDropzone";
import { toast } from "sonner";
import { Download, FileAudio, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AUDIO_FORMATS = [
  { value: "wav", label: "WAV", mimeType: "audio/wav" },
  { value: "mp3", label: "MP3", mimeType: "audio/mpeg" },
  { value: "ogg", label: "OGG", mimeType: "audio/ogg" },
  { value: "webm", label: "WEBM", mimeType: "audio/webm" },
];

export const AudioConverter = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("wav");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const detectFormat = (file: File): string => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const format = AUDIO_FORMATS.find((f) => f.value === ext);
    return format?.value || "unknown";
  };

  const handleFileDrop = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSourceFile(file);
      const format = detectFormat(file);
      setSourceFormat(format);
      toast.success(`Detected format: ${format.toUpperCase()}`);
    }
  };

  const convertAudio = async () => {
    if (!sourceFile) {
      toast.error("Please select a file to convert");
      return;
    }

    setIsConverting(true);
    setProgress(0);

    try {
      // Create audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;

      setProgress(20);

      // Read file as array buffer
      const arrayBuffer = await sourceFile.arrayBuffer();
      setProgress(40);

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(60);

      // Convert to target format
      const targetMimeType = AUDIO_FORMATS.find((f) => f.value === targetFormat)?.mimeType || "audio/wav";
      
      // Create offline context for rendering
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();
      setProgress(80);

      // Convert to WAV format (browser limitation - can't directly encode to MP3/OGG without libraries)
      const wavBlob = await bufferToWave(renderedBuffer);
      setProgress(100);

      // Download the converted file
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sourceFile.name.split(".")[0]}_converted.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Audio converted successfully!");
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert audio. Some formats may not be supported by your browser.");
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const bufferToWave = (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numberOfChannels * 2;
      const buffer = new ArrayBuffer(44 + length);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      // WAV header
      writeString(0, "RIFF");
      view.setUint32(4, 36 + length, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, audioBuffer.sampleRate, true);
      view.setUint32(28, audioBuffer.sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, length, true);

      // Write audio data
      const channels = [];
      for (let i = 0; i < numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      let offset = 44;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, channels[channel][i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
          offset += 2;
        }
      }

      resolve(new Blob([buffer], { type: "audio/wav" }));
    });
  };

  return (
    <Card className="glass-panel border-neon-cyan/20 p-6">
      <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
        Audio Format Converter
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Source File
          </label>
          <FileDropzone onFilesAdded={handleFileDrop} />
          {sourceFile && (
            <div className="mt-4 p-4 bg-background/50 rounded-lg border border-neon-cyan/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-neon-cyan" />
                  <div>
                    <p className="font-medium text-foreground">{sourceFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Format: {sourceFormat.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              From
            </label>
            <div className="p-3 bg-background/50 rounded-lg border border-neon-cyan/20 text-center">
              <p className="text-lg font-bold text-neon-cyan">
                {sourceFormat ? sourceFormat.toUpperCase() : "---"}
              </p>
            </div>
          </div>

          <ArrowRight className="w-8 h-8 text-neon-purple mt-6" />

          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              To
            </label>
            <Select value={targetFormat} onValueChange={setTargetFormat}>
              <SelectTrigger className="border-neon-pink/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIO_FORMATS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isConverting && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-muted-foreground">
              Converting... {progress}%
            </p>
          </div>
        )}

        <Button
          onClick={convertAudio}
          disabled={!sourceFile || isConverting}
          className="w-full bg-gradient-to-r from-neon-cyan to-neon-pink hover:opacity-90"
        >
          <Download className="w-4 h-4 mr-2" />
          {isConverting ? "Converting..." : "Convert & Download"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Note: Browser-based conversion supports WAV output. For MP3/OGG, the file will be
          converted to WAV format due to browser limitations.
        </p>
      </div>
    </Card>
  );
};
