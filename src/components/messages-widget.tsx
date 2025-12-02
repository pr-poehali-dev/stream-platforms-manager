import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  replied_at: string | null;
}

interface MessagesWidgetProps {
  isAuthenticated: boolean;
}

export function MessagesWidget({ isAuthenticated }: MessagesWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadMessages();
    }
  }, [isAuthenticated, isOpen]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMessages();
      setMessages(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-96 max-h-[500px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Mail" size={20} />
              <h3 className="font-semibold">Сообщения</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/messages')}
              >
                <Icon name="ExternalLink" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Icon name="Loader2" className="animate-spin" size={24} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Icon name="Mail" size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Нет сообщений</p>
              </div>
            ) : (
              <div className="divide-y">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => navigate('/messages')}
                    className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                      !message.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {!message.is_read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                        <span className={`font-medium truncate text-sm ${!message.is_read ? 'font-bold' : ''}`}>
                          {message.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {message.message}
                    </div>
                    {message.replied_at && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <Icon name="Reply" size={12} />
                        Отвечено
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {messages.length > 0 && (
            <div className="p-3 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/messages')}
              >
                Посмотреть все сообщения
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg relative"
          onClick={() => {
            setIsOpen(true);
            loadMessages();
          }}
        >
          <Icon name="Mail" size={24} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}
