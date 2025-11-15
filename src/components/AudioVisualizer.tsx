import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
}

function DancingBlocks({ analyserNode, isPlaying }: { analyserNode: AnalyserNode | null; isPlaying: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (analyserNode) {
      const bufferLength = analyserNode.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;
    }
  }, [analyserNode]);

  useFrame(() => {
    if (!analyserNode || !dataArrayRef.current) return;

    // Get frequency data even when not playing (for smooth transitions)
    analyserNode.getByteFrequencyData(dataArrayRef.current as any);
    
    meshesRef.current.forEach((mesh, i) => {
      const dataIndex = Math.floor((i / meshesRef.current.length) * dataArrayRef.current!.length);
      const value = isPlaying ? dataArrayRef.current![dataIndex] / 255 : 0;
      
      // Smooth animation
      const targetScale = 0.5 + value * 3;
      mesh.scale.y += (targetScale - mesh.scale.y) * 0.1;
      mesh.position.y = (mesh.scale.y - 1) / 2;
      
      const hue = (i / meshesRef.current.length) * 360;
      (mesh.material as THREE.MeshStandardMaterial).color.setHSL(hue / 360, 1, 0.5);
      (mesh.material as THREE.MeshStandardMaterial).emissive.setHSL(hue / 360, 1, value * 0.5);
    });

    if (groupRef.current && isPlaying) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const blockCount = 32;
  const radius = 8;

  return (
    <group ref={groupRef}>
      {Array.from({ length: blockCount }).map((_, i) => {
        const angle = (i / blockCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) meshesRef.current[i] = el;
            }}
            position={[x, 0, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.8, 1, 0.8]} />
            <meshStandardMaterial 
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export const AudioVisualizer = ({ analyserNode, isPlaying }: AudioVisualizerProps) => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden border-neon-purple/20 neon-glow-purple" style={{ height: "500px" }}>
      <Canvas 
        camera={{ position: [0, 10, 20], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0f');
        }}
      >
        <color attach="background" args={["#0a0a0f"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
        <DancingBlocks analyserNode={analyserNode} isPlaying={isPlaying} />
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
};
