import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Scissors, RotateCcw } from "lucide-react";
import { Track } from "./MusicPlayer";
import { toast } from "sonner";

interface WaveformEditorProps {
  track: Track;
  onTrimUpdate: (trackId: string, trimStart: number, trimEnd: number) => void;
}

export const WaveformEditor = ({ track, onTrimUpdate }: WaveformEditorProps) => {
  const [trimStart, setTrimStart] = useState(track.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(track.trimEnd || 0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(track.url);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      const audioDuration = audio.duration;
      setDuration(audioDuration);
      setTrimEnd(track.trimEnd || audioDuration);
      generateWaveform(audio);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [track]);

  useEffect(() => {
    drawWaveform();
  }, [waveformData, trimStart, trimEnd]);

  const generateWaveform = async (audio: HTMLAudioElement) => {
    try {
      const audioContext = new AudioContext();
      const response = await fetch(track.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = audioBuffer.getChannelData(0);
      const samples = 200;
      const blockSize = Math.floor(rawData.length / samples);
      const filteredData: number[] = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        filteredData.push(sum / blockSize);
      }

      const multiplier = Math.pow(Math.max(...filteredData), -1);
      const normalizedData = filteredData.map((n) => n * multiplier);
      setWaveformData(normalizedData);
    } catch (error) {
      console.error("Error generating waveform:", error);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.fillRect(0, 0, width, height);

    // Calculate trim positions
    const trimStartPos = (trimStart / duration) * width;
    const trimEndPos = (trimEnd / duration) * width;

    // Draw trimmed out regions
    ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
    ctx.fillRect(0, 0, trimStartPos, height);
    ctx.fillRect(trimEndPos, 0, width - trimEndPos, height);

    // Draw active region
    ctx.fillStyle = "rgba(34, 211, 238, 0.1)";
    ctx.fillRect(trimStartPos, 0, trimEndPos - trimStartPos, height);

    // Draw waveform bars
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height * 0.8;
      const y = (height - barHeight) / 2;

      // Color based on whether bar is in active region
      if (x >= trimStartPos && x <= trimEndPos) {
        ctx.fillStyle = "rgba(34, 211, 238, 0.8)"; // neon cyan
      } else {
        ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
      }

      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw trim markers
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(trimStartPos, 0);
    ctx.lineTo(trimStartPos, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(trimEndPos, 0);
    ctx.lineTo(trimEndPos, height);
    ctx.stroke();
  };

  const handleApplyTrim = () => {
    if (trimStart >= trimEnd) {
      toast.error("Start time must be less than end time");
      return;
    }
    onTrimUpdate(track.id, trimStart, trimEnd);
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    onTrimUpdate(track.id, 0, duration);
    toast.success("Trim reset");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="glass-panel border-neon-cyan/20 neon-glow-cyan p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Waveform Editor</h3>
          <div className="text-sm text-muted-foreground">
            {track.name}
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={150}
            className="w-full rounded-lg border border-neon-cyan/20"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trim Start</span>
              <span className="text-neon-cyan font-mono">{formatTime(trimStart)}</span>
            </div>
            <Slider
              value={[trimStart]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={([value]) => setTrimStart(value)}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Trim End</span>
              <span className="text-neon-cyan font-mono">{formatTime(trimEnd)}</span>
            </div>
            <Slider
              value={[trimEnd]}
              min={0}
              max={duration}
              step={0.1}
              onValueChange={([value]) => setTrimEnd(value)}
              className="cursor-pointer"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Duration: {formatTime(trimEnd - trimStart)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApplyTrim} className="flex-1 gap-2">
            <Scissors className="w-4 h-4" />
            Apply Trim
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
