import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AudioEffectsProps {
  bassFilter: BiquadFilterNode | null;
  midFilter: BiquadFilterNode | null;
  trebleFilter: BiquadFilterNode | null;
}

const presets = {
  flat: { bass: 0, mid: 0, treble: 0 },
  rock: { bass: 5, mid: 3, treble: 4 },
  jazz: { bass: 3, mid: -2, treble: 2 },
  pop: { bass: 4, mid: 2, treble: 3 },
  classical: { bass: 2, mid: 0, treble: 3 },
  electronic: { bass: 6, mid: -1, treble: 5 },
  vocal: { bass: -2, mid: 4, treble: 2 },
};

export const AudioEffects = ({ bassFilter, midFilter, trebleFilter }: AudioEffectsProps) => {
  const [bass, setBass] = useState(0);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(0);

  const applyEQ = (bassValue: number, midValue: number, trebleValue: number) => {
    if (bassFilter) bassFilter.gain.value = bassValue;
    if (midFilter) midFilter.gain.value = midValue;
    if (trebleFilter) trebleFilter.gain.value = trebleValue;

    setBass(bassValue);
    setMid(midValue);
    setTreble(trebleValue);
  };

  const applyPreset = (preset: keyof typeof presets) => {
    const values = presets[preset];
    applyEQ(values.bass, values.mid, values.treble);
    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`);
  };

  return (
    <div className="glass-panel rounded-xl p-6 border-neon-pink/20 neon-glow-pink space-y-6">
      <h3 className="text-xl font-bold text-neon-pink mb-4">Audio Effects & Equalizer</h3>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Bass</Label>
            <span className="text-sm text-neon-cyan">{bass > 0 ? '+' : ''}{bass} dB</span>
          </div>
          <Slider
            value={[bass]}
            min={-10}
            max={10}
            step={1}
            onValueChange={([value]) => applyEQ(value, mid, treble)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Mid</Label>
            <span className="text-sm text-neon-cyan">{mid > 0 ? '+' : ''}{mid} dB</span>
          </div>
          <Slider
            value={[mid]}
            min={-10}
            max={10}
            step={1}
            onValueChange={([value]) => applyEQ(bass, value, treble)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">Treble</Label>
            <span className="text-sm text-neon-cyan">{treble > 0 ? '+' : ''}{treble} dB</span>
          </div>
          <Slider
            value={[treble]}
            min={-10}
            max={10}
            step={1}
            onValueChange={([value]) => applyEQ(bass, mid, value)}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Label className="text-foreground mb-3 block">Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(presets).map((preset) => (
            <Button
              key={preset}
              variant="outline"
              onClick={() => applyPreset(preset as keyof typeof presets)}
              className="hover:bg-primary/20 hover:text-primary hover:border-primary transition-all"
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
