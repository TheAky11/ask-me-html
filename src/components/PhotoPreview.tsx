import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Download, Eye, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
interface PhotoPreviewProps {
  lastPhoto: string | null;
  isScanning: boolean;
}
export function PhotoPreview({
  lastPhoto,
  isScanning
}: PhotoPreviewProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Simulate photo capture during scanning
  useEffect(() => {
    if (isScanning) {
      const captureInterval = setInterval(() => {
        setIsCapturing(true);

        // Simulate camera capture delay
        setTimeout(() => {
          // Generate a placeholder image URL (in real app, this would be from your camera)
          setPreviewImage(`https://picsum.photos/400/300?random=${Date.now()}`);
          setIsCapturing(false);
        }, 500);
      }, 5000); // Capture every 5 seconds during scanning

      return () => clearInterval(captureInterval);
    }
  }, [isScanning]);
  const capturePhoto = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setPreviewImage(`https://picsum.photos/400/300?random=${Date.now()}`);
      setIsCapturing(false);
    }, 800);
  };
  const downloadPhoto = () => {
    if (previewImage) {
      const link = document.createElement('a');
      link.href = previewImage;
      link.download = `scan-photo-${new Date().toISOString()}.jpg`;
      link.click();
    }
  };
  return <Card className="border-scanner-secondary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-scanner-secondary" />
          Photo Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] bg-scanner-console rounded-lg overflow-hidden border border-scanner-secondary/20">
          {previewImage ? <img src={previewImage} alt="Scanner preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <Camera className="w-12 h-12 mx-auto opacity-50" />
                <p className="text-sm">No photo captured yet</p>
              </div>
            </div>}
          
          {/* Capturing overlay */}
          {isCapturing && <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
              <div className="bg-black/50 rounded-lg px-4 py-2 text-white flex items-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Capturing...</span>
              </div>
            </div>}

          {/* Scanning indicator */}
          {isScanning && !isCapturing && <div className="absolute top-2 right-2">
              <div className="bg-scanner-danger/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1 animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>}
        </div>

        

        {previewImage && <div className="text-xs text-muted-foreground text-center">
            Last captured: {new Date().toLocaleTimeString()}
          </div>}
      </CardContent>
    </Card>;
}