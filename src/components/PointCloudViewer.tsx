import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box } from "@react-three/drei";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Download, Eye, Maximize2 } from "lucide-react";
import * as THREE from "three";
interface PointCloudViewerProps {
  isScanning: boolean;
  progress: number;
  pointsCollected: number;
}
function PointCloud({
  pointsCollected,
  progress
}: {
  pointsCollected: number;
  progress: number;
}) {
  const meshRef = useRef<THREE.Points>(null);

  // Generate point cloud data
  const {
    positions,
    colors
  } = useMemo(() => {
    const count = Math.min(pointsCollected, 50000); // Limit for performance
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a more interesting point cloud shape (like a scanned object)
      const angle = i / count * Math.PI * 4;
      const radius = 2 + Math.sin(angle * 3) * 0.5;
      const height = Math.sin(angle * 2) * 1.5;
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = height + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.1;

      // Color based on height and progress
      const normalizedHeight = (height + 1.5) / 3;
      colors[i * 3] = 0.2 + normalizedHeight * 0.8; // R
      colors[i * 3 + 1] = 0.8; // G
      colors[i * 3 + 2] = 0.4 + (1 - normalizedHeight) * 0.6; // B
    }
    return {
      positions,
      colors
    };
  }, [pointsCollected]);

  // Animate the point cloud
  useFrame(state => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });
  return <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors sizeAttenuation={false} />
    </points>;
}
function ScanningIndicator({
  progress
}: {
  progress: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(state => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
  });
  return <group>
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <ringGeometry args={[3, 3.2, 32]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
      <Text position={[0, -4, 0]} fontSize={0.5} color="#22c55e" anchorX="center" anchorY="middle">
        {`Scanning: ${progress.toFixed(1)}%`}
      </Text>
    </group>;
}
export function PointCloudViewer({
  isScanning,
  progress,
  pointsCollected
}: PointCloudViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const resetView = () => {
    // This would reset the camera position in a real implementation
    console.log("Reset view");
  };
  const exportPointCloud = () => {
    // Simulate point cloud export
    const data = `# Point Cloud Export
# Points: ${pointsCollected}
# Generated: ${new Date().toISOString()}
# Format: X Y Z R G B
`;
    const blob = new Blob([data], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `point-cloud-${Date.now()}.ply`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <Card className="border-scanner-primary/20 h-[800px] flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-scanner-primary" />
            Real-time Point Cloud
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {pointsCollected.toLocaleString()} points
            </Badge>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCw className="w-3 h-3 mr-1" />
              Reset View
            </Button>
            <Button variant="outline" size="sm" onClick={exportPointCloud} disabled={pointsCollected === 0}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="w-full h-full bg-gradient-to-br from-scanner-console to-background rounded-b-lg relative overflow-hidden">
          <Canvas camera={{
          position: [5, 5, 5],
          fov: 60
        }} className="w-full h-full">
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#0ea5e9" />
            
            {pointsCollected > 0 && <PointCloud pointsCollected={pointsCollected} progress={progress} />}
            
            {isScanning && <ScanningIndicator progress={progress} />}
            
            {/* Grid */}
            <gridHelper args={[10, 10, "#334155", "#1e293b"]} />
            
            {/* Coordinate axes */}
            <Box position={[0, 0, 0]} args={[0.1, 2, 0.1]}>
              <meshBasicMaterial color="#ef4444" />
            </Box>
            <Box position={[1, 0, 0]} args={[2, 0.1, 0.1]}>
              <meshBasicMaterial color="#22c55e" />
            </Box>
            <Box position={[0, 0, 1]} args={[0.1, 0.1, 2]}>
              <meshBasicMaterial color="#3b82f6" />
            </Box>
            
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxPolarAngle={Math.PI} minPolarAngle={0} />
          </Canvas>
          
          {/* Overlay controls */}
          <div className="absolute top-4 left-4 space-y-2">
            <Badge className="bg-black/50 text-white border-none">
              Camera Controls: Mouse/Touch
            </Badge>
            {isScanning && <Badge className="bg-scanner-primary/80 text-white border-none animate-pulse">
                Live Scanning
              </Badge>}
          </div>

          {pointsCollected === 0 && !isScanning && <div className="absolute inset-0 flex items-center justify-center rounded-none">
              <div className="text-center space-y-4 text-muted-foreground">
                <Eye className="w-16 h-16 mx-auto opacity-50" />
                <div>
                  <h3 className="text-lg font-medium">No Point Cloud Data</h3>
                  <p className="text-sm">Start a scan to see real-time 3D visualization</p>
                </div>
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}