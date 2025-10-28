import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}

interface ActivityLogProps {
  maxEntries?: number;
}

const logTypeStyles = {
  info: 'text-blue-500',
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
};

const logTypeIcons = {
  info: 'Info',
  success: 'CheckCircle2',
  error: 'XCircle',
  warning: 'AlertTriangle',
};

let logListeners: ((entry: LogEntry) => void)[] = [];

export function addLog(message: string, type: LogEntry['type'] = 'info') {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random()}`,
    message,
    type,
    timestamp: new Date(),
  };
  
  logListeners.forEach(listener => listener(entry));
}

export function ActivityLog({ maxEntries = 50 }: ActivityLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const listener = (entry: LogEntry) => {
      setLogs(prev => [entry, ...prev].slice(0, maxEntries));
    };
    
    logListeners.push(listener);
    
    return () => {
      logListeners = logListeners.filter(l => l !== listener);
    };
  }, [maxEntries]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2 border-b p-4">
        <Icon name="Activity" size={20} />
        <h3 className="font-semibold">Активность</h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 p-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Логи действий появятся здесь
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 text-sm border-l-2 pl-3 py-2"
                style={{
                  borderColor: `var(--${log.type === 'info' ? 'blue' : log.type === 'success' ? 'green' : log.type === 'error' ? 'red' : 'yellow'}-500)`,
                }}
              >
                <Icon
                  name={logTypeIcons[log.type] as any}
                  size={16}
                  className={cn('mt-0.5 flex-shrink-0', logTypeStyles[log.type])}
                />
                <div className="flex-1 min-w-0">
                  <p className="break-words">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.timestamp.toLocaleTimeString('ru-RU')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
