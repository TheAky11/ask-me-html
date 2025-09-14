import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, Download, Zap, Eye } from "lucide-react";
import { ScannerConsole } from "./ScannerConsole";
import { PhotoPreview } from "./PhotoPreview";
import { PointCloudViewer } from "./PointCloudViewer";
import { cn } from "@/lib/utils";
interface ScannerStatus {
  isScanning: boolean;
  progress: number;
  status: 'idle' | 'scanning' | 'processing' | 'complete' | 'error';
  pointsCollected: number;
  estimatedTime: number;
}
export function ScannerDashboard() {
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>({
    isScanning: false,
    progress: 0,
    status: 'idle',
    pointsCollected: 0,
    estimatedTime: 0
  });
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const startScan = () => {
    setScannerStatus(prev => ({
      ...prev,
      isScanning: true,
      status: 'scanning',
      progress: 0,
      pointsCollected: 0,
      estimatedTime: 300 // 5 minutes estimated
    }));
  };
  const stopScan = () => {
    setScannerStatus(prev => ({
      ...prev,
      isScanning: false,
      status: 'idle',
      progress: 0
    }));
  };
  const resetScan = () => {
    setScannerStatus({
      isScanning: false,
      progress: 0,
      status: 'idle',
      pointsCollected: 0,
      estimatedTime: 0
    });
    setLastPhoto(null);
  };

  // Simulate scanning progress
  useEffect(() => {
    if (scannerStatus.isScanning) {
      const interval = setInterval(() => {
        setScannerStatus(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 2, 100);
          const newPoints = Math.floor(newProgress * 1000);
          if (newProgress >= 100) {
            return {
              ...prev,
              progress: 100,
              status: 'complete',
              isScanning: false,
              pointsCollected: newPoints
            };
          }
          return {
            ...prev,
            progress: newProgress,
            pointsCollected: newPoints,
            estimatedTime: Math.max(0, prev.estimatedTime - 1)
          };
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [scannerStatus.isScanning]);
  const getStatusColor = () => {
    switch (scannerStatus.status) {
      case 'scanning':
        return 'scanner-primary';
      case 'processing':
        return 'scanner-secondary';
      case 'complete':
        return 'scanner-success';
      case 'error':
        return 'scanner-danger';
      default:
        return 'muted';
    }
  };
  const getStatusText = () => {
    switch (scannerStatus.status) {
      case 'scanning':
        return 'Scanning...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-scanner bg-clip-text text-transparent">PiLidar</h1>
          <p className="text-muted-foreground mt-2">Raspberry Pi 4 · Real-time 3D Scanning</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className={cn("px-4 py-2 text-sm font-medium", scannerStatus.isScanning && "animate-pulse-glow")}>
            <div className={cn("w-2 h-2 rounded-full mr-2", `bg-${getStatusColor()}`)} />
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls & Progress */}
        <div className="space-y-6">
          {/* Scanner Controls */}
          <Card className="border-scanner-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-scanner-primary" />
                Scanner Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="scanner" size="lg" onClick={startScan} disabled={scannerStatus.isScanning} className="h-12">
                  <Play className="w-4 h-4 mr-2" />
                  Start Scan
                </Button>
                <Button variant="destructive" size="lg" onClick={stopScan} disabled={!scannerStatus.isScanning} className="h-12">
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
              
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{scannerStatus.progress.toFixed(1)}%</span>
                </div>
                <Progress value={scannerStatus.progress} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Points Collected</p>
                  <p className="font-mono font-bold text-scanner-primary">
                    {scannerStatus.pointsCollected.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Est. Time Left</p>
                  <p className="font-mono font-bold text-scanner-secondary">
                    {formatTime(scannerStatus.estimatedTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Preview */}
          <PhotoPreview lastPhoto={lastPhoto} isScanning={scannerStatus.isScanning} />
        </div>

        {/* Center Column - Point Cloud */}
        <div className="lg:col-span-2">
          <PointCloudViewer isScanning={scannerStatus.isScanning} progress={scannerStatus.progress} pointsCollected={scannerStatus.pointsCollected} />
        </div>
      </div>

      {/* Console */}
      <ScannerConsole isScanning={scannerStatus.isScanning} status={scannerStatus.status} />
    </div>;
}