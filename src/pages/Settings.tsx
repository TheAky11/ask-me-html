import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

interface ConfigData {
  scanner: {
    resolution: string;
    scanSpeed: number;
    pointDensity: number;
    maxRange: number;
    minRange: number;
  };
  laser: {
    power: number;
    frequency: number;
    pulseWidth: number;
    wavelength: number;
  };
  motor: {
    stepAngle: number;
    speed: number;
    acceleration: number;
    microstepping: number;
  };
  camera: {
    exposure: number;
    gain: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
  processing: {
    noiseFilter: boolean;
    smoothing: number;
    outlierRemoval: boolean;
    compressionLevel: number;
  };
}

export default function Settings() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [defaultConfig, setDefaultConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [configResponse, defaultResponse] = await Promise.all([
          fetch('/config.json'),
          fetch('/config-default.json')
        ]);
        
        const configData = await configResponse.json();
        const defaultData = await defaultResponse.json();
        
        setConfig(configData);
        setDefaultConfig(defaultData);
      } catch (error) {
        console.error('Error loading config files:', error);
        toast.error("Failed to load configuration files");
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, []);

  const updateConfig = (category: string, key: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [category]: {
        ...prev![category as keyof ConfigData],
        [key]: value
      }
    }));
  };

  const saveConfig = async () => {
    try {
      // In a real implementation, this would save to the server
      console.log('Saving config:', config);
      toast.success("Configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const restoreDefaults = () => {
    if (defaultConfig) {
      setConfig({ ...defaultConfig });
      toast.success("Configuration restored to defaults");
    }
  };

  const getDefaultValue = (category: string, key: string) => {
    if (!defaultConfig) return '';
    return defaultConfig[category as keyof ConfigData][key as any];
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-16 h-16 mx-auto text-muted-foreground animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-scanner bg-clip-text text-transparent">Scanner Settings</h1>
            <p className="text-muted-foreground mt-2">Configure your laser scanner parameters</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={restoreDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore Defaults
          </Button>
          <Button variant="scanner" onClick={saveConfig}>
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scanner Settings */}
        <Card className="border-scanner-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-scanner-primary" />
              Scanner Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">Resolution</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="resolution"
                  value={config.scanner.resolution}
                  onChange={(e) => updateConfig('scanner', 'resolution', e.target.value)}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('scanner', 'resolution')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scanSpeed">Scan Speed (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="scanSpeed"
                  type="number"
                  min="1"
                  max="100"
                  value={config.scanner.scanSpeed}
                  onChange={(e) => updateConfig('scanner', 'scanSpeed', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('scanner', 'scanSpeed')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointDensity">Point Density</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pointDensity"
                  type="number"
                  min="10"
                  max="1000"
                  value={config.scanner.pointDensity}
                  onChange={(e) => updateConfig('scanner', 'pointDensity', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('scanner', 'pointDensity')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minRange">Min Range (m)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="minRange"
                    type="number"
                    step="0.1"
                    min="0"
                    value={config.scanner.minRange}
                    onChange={(e) => updateConfig('scanner', 'minRange', parseFloat(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('scanner', 'minRange')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRange">Max Range (m)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="maxRange"
                    type="number"
                    step="0.1"
                    min="0"
                    value={config.scanner.maxRange}
                    onChange={(e) => updateConfig('scanner', 'maxRange', parseFloat(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('scanner', 'maxRange')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Laser Settings */}
        <Card className="border-scanner-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-scanner-secondary rounded-full" />
              Laser Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="power">Power (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="power"
                  type="number"
                  min="1"
                  max="100"
                  value={config.laser.power}
                  onChange={(e) => updateConfig('laser', 'power', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('laser', 'power')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency (Hz)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="frequency"
                  type="number"
                  min="100"
                  max="10000"
                  value={config.laser.frequency}
                  onChange={(e) => updateConfig('laser', 'frequency', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('laser', 'frequency')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pulseWidth">Pulse Width (ns)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pulseWidth"
                    type="number"
                    min="1"
                    max="100"
                    value={config.laser.pulseWidth}
                    onChange={(e) => updateConfig('laser', 'pulseWidth', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('laser', 'pulseWidth')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wavelength">Wavelength (nm)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="wavelength"
                    type="number"
                    min="700"
                    max="1000"
                    value={config.laser.wavelength}
                    onChange={(e) => updateConfig('laser', 'wavelength', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('laser', 'wavelength')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motor Settings */}
        <Card className="border-scanner-success/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-scanner-success rounded-full" />
              Motor Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stepAngle">Step Angle (°)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="stepAngle"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={config.motor.stepAngle}
                    onChange={(e) => updateConfig('motor', 'stepAngle', parseFloat(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('motor', 'stepAngle')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speed (RPM)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="speed"
                    type="number"
                    min="1"
                    max="1000"
                    value={config.motor.speed}
                    onChange={(e) => updateConfig('motor', 'speed', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('motor', 'speed')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acceleration">Acceleration</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="acceleration"
                    type="number"
                    min="1"
                    max="100"
                    value={config.motor.acceleration}
                    onChange={(e) => updateConfig('motor', 'acceleration', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('motor', 'acceleration')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="microstepping">Microstepping</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="microstepping"
                    type="number"
                    min="1"
                    max="256"
                    value={config.motor.microstepping}
                    onChange={(e) => updateConfig('motor', 'microstepping', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('motor', 'microstepping')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camera Settings */}
        <Card className="border-scanner-warning/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-scanner-warning rounded-full" />
              Camera Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exposure">Exposure</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="exposure"
                  type="number"
                  min="1"
                  max="1000"
                  value={config.camera.exposure}
                  onChange={(e) => updateConfig('camera', 'exposure', parseInt(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('camera', 'exposure')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gain">Gain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="gain"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={config.camera.gain}
                  onChange={(e) => updateConfig('camera', 'gain', parseFloat(e.target.value))}
                />
                <Badge variant="outline" className="text-xs">
                  default: {getDefaultValue('camera', 'gain')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="brightness">Brightness</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="brightness"
                    type="number"
                    min="0"
                    max="100"
                    value={config.camera.brightness}
                    onChange={(e) => updateConfig('camera', 'brightness', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('camera', 'brightness')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrast">Contrast</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="contrast"
                    type="number"
                    min="0"
                    max="100"
                    value={config.camera.contrast}
                    onChange={(e) => updateConfig('camera', 'contrast', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('camera', 'contrast')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saturation">Saturation</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="saturation"
                    type="number"
                    min="0"
                    max="200"
                    value={config.camera.saturation}
                    onChange={(e) => updateConfig('camera', 'saturation', parseInt(e.target.value))}
                  />
                  <Badge variant="outline" className="text-xs">
                    {getDefaultValue('camera', 'saturation')}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Settings */}
        <Card className="border-scanner-primary/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-scanner-primary rounded-full" />
              Processing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="noiseFilter" className="text-sm font-medium">
                    Noise Filter
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="noiseFilter"
                      checked={config.processing.noiseFilter}
                      onCheckedChange={(checked) => updateConfig('processing', 'noiseFilter', checked)}
                    />
                    <Badge variant="outline" className="text-xs">
                      default: {getDefaultValue('processing', 'noiseFilter') ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="outlierRemoval" className="text-sm font-medium">
                    Outlier Removal
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="outlierRemoval"
                      checked={config.processing.outlierRemoval}
                      onCheckedChange={(checked) => updateConfig('processing', 'outlierRemoval', checked)}
                    />
                    <Badge variant="outline" className="text-xs">
                      default: {getDefaultValue('processing', 'outlierRemoval') ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smoothing">Smoothing Level</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="smoothing"
                      type="number"
                      min="0"
                      max="10"
                      value={config.processing.smoothing}
                      onChange={(e) => updateConfig('processing', 'smoothing', parseInt(e.target.value))}
                    />
                    <Badge variant="outline" className="text-xs">
                      default: {getDefaultValue('processing', 'smoothing')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="compressionLevel">Compression Level</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="compressionLevel"
                      type="number"
                      min="1"
                      max="9"
                      value={config.processing.compressionLevel}
                      onChange={(e) => updateConfig('processing', 'compressionLevel', parseInt(e.target.value))}
                    />
                    <Badge variant="outline" className="text-xs">
                      default: {getDefaultValue('processing', 'compressionLevel')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}