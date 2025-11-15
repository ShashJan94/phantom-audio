import { useState, useRef, useEffect } from "react";
import { PlaybackControls } from "./PlaybackControls";
import { TrackList } from "./TrackList";
import { FileDropzone } from "./FileDropzone";
import { ProgressBar } from "./ProgressBar";
import { VolumeControl } from "./VolumeControl";
import { AudioVisualizer } from "./AudioVisualizer";
import { FrequencyAnalyzer } from "./FrequencyAnalyzer";
import { PlaylistManager } from "./PlaylistManager";
import { AudioTrimmer } from "./AudioTrimmer";
import { AudioEffects } from "./AudioEffects";
import { AudioRecorder } from "./AudioRecorder";
import { PlaylistImportExport } from "./PlaylistImportExport";
import { WaveformEditor } from "./WaveformEditor";
import { LyricsDisplay } from "./LyricsDisplay";
import { AudioConverter } from "./AudioConverter";
import { MusicSearch } from "./MusicSearch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Track {
  id: string;
  name: string;
  duration: number;
  file: File;
  url: string;
  trimStart?: number;
  trimEnd?: number;
  lyrics?: string;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}

export const MusicPlayer = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Initialize Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const gainNode = audioContext.createGain();
    gainNodeRef.current = gainNode;

    // Create EQ filters
    const bassFilter = audioContext.createBiquadFilter();
    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 200;
    bassFilterRef.current = bassFilter;

    const midFilter = audioContext.createBiquadFilter();
    midFilter.type = "peaking";
    midFilter.frequency.value = 1000;
    midFilterRef.current = midFilter;

    const trebleFilter = audioContext.createBiquadFilter();
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 3000;
    trebleFilterRef.current = trebleFilter;

    audio.addEventListener("timeupdate", () => {
      const track = currentTrack;
      if (track && track.trimEnd && audio.currentTime >= track.trimEnd) {
        handleTrackEnd();
      } else {
        setCurrentTime(audio.currentTime);
      }
    });

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("ended", handleTrackEnd);

    return () => {
      audio.pause();
      audio.src = "";
      audioContext.close();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      audioRef.current?.play();
    } else {
      handleNext();
    }
  };

  const getCurrentTrackList = () => {
    if (currentPlaylist) {
      const playlist = playlists.find((p) => p.id === currentPlaylist);
      return playlist ? tracks.filter((t) => playlist.trackIds.includes(t.id)) : [];
    }
    return tracks;
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
    if (audioRef.current && audioContextRef.current) {
      const audio = audioRef.current;
      audio.src = track.url;
      
      if (track.trimStart) {
        audio.currentTime = track.trimStart;
      }

      // Connect audio nodes
      if (!sourceRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audio);
        sourceRef.current = source;
        
        source
          .connect(bassFilterRef.current!)
          .connect(midFilterRef.current!)
          .connect(trebleFilterRef.current!)
          .connect(gainNodeRef.current!)
          .connect(analyserRef.current!)
          .connect(audioContextRef.current.destination);
      }

      audio.play();
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
    const trackList = getCurrentTrackList();
    if (trackList.length === 0) return;

    const currentIndex = trackList.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * trackList.length);
    } else {
      nextIndex = (currentIndex + 1) % trackList.length;
    }

    playTrack(trackList[nextIndex]);
  };

  const handlePrevious = () => {
    const trackList = getCurrentTrackList();
    if (trackList.length === 0) return;

    if (audioRef.current && currentTime > 3) {
      audioRef.current.currentTime = currentTrack?.trimStart || 0;
      return;
    }

    const currentIndex = trackList.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? trackList.length - 1 : currentIndex - 1;
    playTrack(trackList[prevIndex]);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      const track = currentTrack;
      const minTime = track?.trimStart || 0;
      const maxTime = track?.trimEnd || duration;
      const clampedTime = Math.max(minTime, Math.min(maxTime, time));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
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

  const handleReorderTracks = (newTracks: Track[]) => {
    setTracks(newTracks);
  };

  const handleTrimUpdate = (trackId: string, trimStart: number, trimEnd: number) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, trimStart, trimEnd } : t
      )
    );
    toast.success("Track trimmed successfully");
  };

  const handleSaveRecording = (file: File) => {
    handleFilesAdded([file]);
  };

  const handlePlaylistsImport = (importedPlaylists: Playlist[]) => {
    setPlaylists((prev) => {
      const existingIds = new Set(prev.map(p => p.id));
      const newPlaylists = importedPlaylists.map(p => {
        if (existingIds.has(p.id)) {
          return { ...p, id: `${p.id}-${Date.now()}` };
        }
        return p;
      });
      return [...prev, ...newPlaylists];
    });
  };

  const handleLyricsUpdate = (trackId: string, lyrics: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, lyrics } : t))
    );
    toast.success("Lyrics updated");
  };

  const handleSearchTrackPlay = (url: string, name: string) => {
    const searchTrack: Track = {
      id: `search-${Date.now()}`,
      name,
      duration: 30,
      file: new File([], name),
      url,
    };
    playTrack(searchTrack);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            Neon Studio
          </h1>
          <p className="text-muted-foreground">Professional music player with studio-grade features</p>
        </header>

        <FileDropzone onFilesAdded={handleFilesAdded} />

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-6">
            <Tabs defaultValue="visualizer" className="w-full">
              <TabsList className="grid w-full grid-cols-8 glass-panel">
                <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
                <TabsTrigger value="frequency">Frequency</TabsTrigger>
                <TabsTrigger value="waveform">Waveform</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
                <TabsTrigger value="recorder">Recorder</TabsTrigger>
                <TabsTrigger value="converter">Converter</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
                <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualizer" className="mt-6">
                <AudioVisualizer
                  analyserNode={analyserRef.current}
                  isPlaying={isPlaying}
                />
              </TabsContent>
              
              <TabsContent value="frequency" className="mt-6">
                <FrequencyAnalyzer
                  analyserNode={analyserRef.current}
                  isPlaying={isPlaying}
                />
              </TabsContent>
              
              <TabsContent value="waveform" className="mt-6">
                {currentTrack ? (
                  <WaveformEditor
                    track={currentTrack}
                    onTrimUpdate={handleTrimUpdate}
                  />
                ) : (
                  <Card className="glass-panel border-neon-cyan/20 p-8 text-center">
                    <p className="text-muted-foreground">Select a track to edit waveform</p>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="effects" className="mt-6">
                <AudioEffects
                  bassFilter={bassFilterRef.current}
                  midFilter={midFilterRef.current}
                  trebleFilter={trebleFilterRef.current}
                />
              </TabsContent>
              
              <TabsContent value="recorder" className="mt-6">
                <AudioRecorder onSaveRecording={handleSaveRecording} />
              </TabsContent>

              <TabsContent value="converter" className="mt-6">
                <AudioConverter />
              </TabsContent>

              <TabsContent value="search" className="mt-6">
                <MusicSearch onPlayTrack={handleSearchTrackPlay} />
              </TabsContent>

              <TabsContent value="lyrics" className="mt-6">
                <LyricsDisplay
                  trackId={currentTrack?.id || null}
                  trackName={currentTrack?.name || null}
                  currentTime={currentTime}
                  lyrics={currentTrack?.lyrics}
                  onLyricsUpdate={handleLyricsUpdate}
                />
              </TabsContent>
            </Tabs>

            <div className="glass-panel rounded-xl p-8 border-neon-cyan/20 neon-glow-cyan">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {currentTrack?.name || "No track selected"}
                  </h2>
                  {currentTrack && (currentTrack.trimStart || currentTrack.trimEnd) && (
                    <p className="text-sm text-neon-cyan">Trimmed Track</p>
                  )}
                </div>

                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={handleSeek}
                  trimStart={currentTrack?.trimStart}
                  trimEnd={currentTrack?.trimEnd}
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

            {currentTrack && (
              <AudioTrimmer
                track={currentTrack}
                onTrimUpdate={handleTrimUpdate}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-xl p-4 border-neon-pink/20 neon-glow-pink">
              <PlaylistImportExport
                playlists={playlists}
                onPlaylistsImport={handlePlaylistsImport}
              />
            </div>

            <PlaylistManager
              playlists={playlists}
              tracks={tracks}
              currentPlaylist={currentPlaylist}
              onPlaylistCreate={(name) => {
                const newPlaylist: Playlist = {
                  id: `playlist-${Date.now()}`,
                  name,
                  trackIds: [],
                };
                setPlaylists((prev) => [...prev, newPlaylist]);
                toast.success(`Playlist "${name}" created`);
              }}
              onPlaylistSelect={setCurrentPlaylist}
              onPlaylistDelete={(id) => {
                setPlaylists((prev) => prev.filter((p) => p.id !== id));
                if (currentPlaylist === id) {
                  setCurrentPlaylist(null);
                }
                toast.success("Playlist deleted");
              }}
              onAddToPlaylist={(playlistId, trackId) => {
                setPlaylists((prev) =>
                  prev.map((p) =>
                    p.id === playlistId
                      ? { ...p, trackIds: [...p.trackIds, trackId] }
                      : p
                  )
                );
                toast.success("Added to playlist");
              }}
              onRemoveFromPlaylist={(playlistId, trackId) => {
                setPlaylists((prev) =>
                  prev.map((p) =>
                    p.id === playlistId
                      ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
                      : p
                  )
                );
                toast.success("Removed from playlist");
              }}
            />

            <TrackList
              tracks={getCurrentTrackList()}
              allTracks={tracks}
              currentTrack={currentTrack}
              playlists={playlists}
              currentPlaylist={currentPlaylist}
              onTrackSelect={playTrack}
              onTrackRemove={handleRemoveTrack}
              onReorder={handleReorderTracks}
              onAddToPlaylist={(playlistId, trackId) => {
                setPlaylists((prev) =>
                  prev.map((p) =>
                    p.id === playlistId && !p.trackIds.includes(trackId)
                      ? { ...p, trackIds: [...p.trackIds, trackId] }
                      : p
                  )
                );
                toast.success("Added to playlist");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
