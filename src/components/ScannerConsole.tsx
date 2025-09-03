import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Terminal, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScannerConsoleProps {
  isScanning: boolean;
  status: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export function ScannerConsole({ isScanning, status }: ScannerConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    
    setLogs(prev => [...prev, newLog].slice(-1000)); // Keep last 1000 logs
  };

  // Simulate console output
  useEffect(() => {
    if (isScanning) {
      const messages = [
        'Initializing laser scanner module...',
        'Calibrating stepper motors...',
        'Starting sensor readings...',
        'Point cloud generation in progress...',
        'Processing LIDAR data stream...',
        'Updating real-time visualization...',
        'Collecting depth measurements...',
        'Optimizing scan trajectory...',
        'Storing point cloud data...',
        'Applying noise reduction filters...'
      ];

      const interval = setInterval(() => {
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        const level = Math.random() > 0.9 ? 'warn' : 'info';
        addLog(level, randomMessage);
      }, 1000 + Math.random() * 2000);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  // Initial logs
  useEffect(() => {
    addLog('success', 'Raspberry Pi 4 Scanner System Ready');
    addLog('info', 'LIDAR sensor connected on GPIO pins 18, 19');
    addLog('info', 'Stepper motors initialized');
    addLog('info', 'Waiting for scan command...');
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Console cleared');
  };

  const exportLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scanner-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-scanner-danger';
      case 'warn': return 'text-scanner-warning';
      case 'success': return 'text-scanner-success';
      default: return 'text-scanner-terminal';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'success': return '✅';
      default: return '💭';
    }
  };

  return (
    <Card className="border-scanner-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-scanner-terminal" />
            Console Output
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(
                "text-xs",
                autoScroll && "bg-scanner-primary/10 border-scanner-primary/30"
              )}
            >
              Auto-scroll {autoScroll ? 'ON' : 'OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={logs.length === 0}
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={consoleRef}
          className="bg-scanner-console rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm space-y-1 border border-scanner-primary/10"
          style={{ scrollBehavior: autoScroll ? 'smooth' : 'auto' }}
        >
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-white/5 px-2 py-1 rounded">
              <span className="text-muted-foreground text-xs shrink-0 mt-0.5">
                {log.timestamp}
              </span>
              <span className="text-xs mt-0.5">
                {getLevelIcon(log.level)}
              </span>
              <span className={cn("text-sm", getLevelColor(log.level))}>
                {log.message}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-muted-foreground text-center py-8">
              No console output yet...
            </div>
          )}
          {isScanning && (
            <div className="flex items-center gap-2 text-scanner-primary animate-pulse">
              <span className="text-xs">●</span>
              <span className="text-sm">Live output streaming...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}