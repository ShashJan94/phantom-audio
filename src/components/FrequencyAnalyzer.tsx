import { useEffect, useRef } from "react";

interface FrequencyAnalyzerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
}

export const FrequencyAnalyzer = ({ analyserNode, isPlaying }: FrequencyAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !analyserNode) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        // Clear canvas when not playing
        ctx.fillStyle = "rgba(10, 10, 15, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(10, 10, 15, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const hue = (i / bufferLength) * 360;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${hue}, 100%, 70%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        ctx.shadowBlur = 0;

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation loop only when playing
    if (isPlaying) {
      draw();
    } else {
      // Clear canvas when not playing
      ctx.fillStyle = "rgba(10, 10, 15, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying]);

  return (
    <div className="glass-panel rounded-xl overflow-hidden border-neon-cyan/20 neon-glow-cyan p-4">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-[400px]"
        style={{ display: "block" }}
      />
    </div>
  );
};
