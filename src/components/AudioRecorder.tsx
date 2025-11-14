import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onSaveRecording: (file: File) => void;
}

export const AudioRecorder = ({ onSaveRecording }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success("Recording stopped");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setIsPlaying(false);
      }
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = URL.createObjectURL(recordedBlob);
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const saveRecording = () => {
    if (recordedBlob) {
      const file = new File(
        [recordedBlob],
        `Recording-${new Date().toISOString()}.webm`,
        { type: "audio/webm" }
      );
      onSaveRecording(file);
      toast.success("Recording saved to library");
      discardRecording();
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="glass-panel border-neon-purple/20 neon-glow-purple p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Audio Recorder</h3>

        <div className="text-center">
          <div className="text-4xl font-mono text-neon-cyan mb-4">
            {formatTime(recordingTime)}
          </div>

          {isRecording && (
            <div className="flex justify-center mb-4">
              <div className={`w-4 h-4 rounded-full bg-red-500 ${isPaused ? '' : 'animate-pulse'}`} />
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="gap-2">
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button onClick={pauseRecording} variant="outline" className="gap-2">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={stopRecording} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}

          {recordedBlob && (
            <>
              <Button onClick={playRecording} variant="outline" className="gap-2">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button onClick={saveRecording} className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button onClick={discardRecording} variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Discard
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
