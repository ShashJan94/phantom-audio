import { useState, useRef, useEffect } from "react";
import { PlaybackControls } from "./PlaybackControls";
import { TrackList } from "./TrackList";
import { FileDropzone } from "./FileDropzone";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { toast } from "sonner";

export interface Track {
  id: string;
  name: string;
  duration: number;
  file: File;
  url: string;
}

export const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("ended", handleTrackEnd);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      audioRef.current?.play();
    } else {
      handleNext();
    }
  };

  const handleFilesAdded = (files: File[]) => {
    const newTracks: Track[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      duration: 0,
      file,
      url: URL.createObjectURL(file),
    }));

    setTracks((prev) => [...prev, ...newTracks]);
    
    if (!currentTrack && newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
    
    toast.success(`Added ${files.length} track${files.length > 1 ? 's' : ''}`);
  };

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (tracks.length === 0) return;

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    playTrack(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (tracks.length === 0) return;

    if (audioRef.current && currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex]);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleRemoveTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Neon Player
          </h1>
          <p className="text-muted-foreground">Drop your music and let the vibes flow</p>
        </header>

        <FileDropzone onFilesAdded={handleFilesAdded} />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-xl p-8 border-neon-cyan/20 neon-glow-cyan">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {currentTrack?.name || "No track selected"}
                  </h2>
                </div>

                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                />

                <div className="flex items-center justify-between">
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={setVolume}
                    onMuteToggle={() => setIsMuted(!isMuted)}
                  />

                  <PlaybackControls
                    isPlaying={isPlaying}
                    isShuffled={isShuffled}
                    repeatMode={repeatMode}
                    onPlayPause={handlePlayPause}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onShuffleToggle={() => setIsShuffled(!isShuffled)}
                    onRepeatToggle={() => {
                      const modes: Array<"off" | "all" | "one"> = ["off", "all", "one"];
                      const currentIndex = modes.indexOf(repeatMode);
                      setRepeatMode(modes[(currentIndex + 1) % modes.length]);
                    }}
                    disabled={tracks.length === 0}
                  />

                  <div className="w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <TrackList
              tracks={tracks}
              currentTrack={currentTrack}
              onTrackSelect={playTrack}
              onTrackRemove={handleRemoveTrack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
