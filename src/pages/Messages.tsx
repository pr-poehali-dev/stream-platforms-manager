import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
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

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMessages();
      setMessages(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await api.markMessageAsRead(messageId);
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ));
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось пометить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await api.deleteMessage(messageId);
      setMessages(messages.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast({
        title: 'Удалено',
        description: 'Сообщение удалено',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сообщение',
        variant: 'destructive',
      });
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setIsReplying(true);
      await api.replyToMessage(selectedMessage.id, replyText.trim());
      
      toast({
        title: 'Отправлено',
        description: 'Ответ отправлен на email пользователя',
      });
      
      setReplyText('');
      setMessages(messages.map(m => 
        m.id === selectedMessage.id ? { ...m, replied_at: new Date().toISOString() } : m
      ));
      if (selectedMessage) {
        setSelectedMessage({ ...selectedMessage, replied_at: new Date().toISOString() });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить ответ',
        variant: 'destructive',
      });
    } finally {
      setIsReplying(false);
    }
  };

  const filteredMessages = messages
    .filter(m => {
      if (filter === 'unread') return !m.is_read;
      if (filter === 'read') return m.is_read;
      return true;
    })
    .filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-purple-600 to-purple-800 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icon name="Mail" size={24} />
              Сообщения
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-12 gap-4 h-full">
          <Card className="col-span-4 flex flex-col h-full">
            <div className="p-4 border-b space-y-4">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск сообщений..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1"
                >
                  Все
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="flex-1"
                >
                  Непрочитанные
                </Button>
                <Button
                  variant={filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('read')}
                  className="flex-1"
                >
                  Прочитанные
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Icon name="Loader2" className="animate-spin" size={32} />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Icon name="Mail" size={48} className="mb-4 opacity-50" />
                  <p>Нет сообщений</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (!message.is_read) {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                        selectedMessage?.id === message.id ? 'bg-accent' : ''
                      } ${!message.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {!message.is_read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                          <span className={`font-medium truncate ${!message.is_read ? 'font-bold' : ''}`}>
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
                      <div className="text-sm text-muted-foreground truncate">
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
          </Card>

          <Card className="col-span-8 flex flex-col h-full">
            {selectedMessage ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold">
                            {selectedMessage.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{selectedMessage.name}</div>
                            <div>{selectedMessage.email}</div>
                          </div>
                        </div>
                        <div className="text-xs">
                          {new Date(selectedMessage.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                    >
                      <Icon name="Trash2" size={18} className="text-destructive" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Ответить</label>
                      {selectedMessage.replied_at && (
                        <Badge variant="outline" className="text-green-600">
                          <Icon name="Check" size={12} className="mr-1" />
                          Отвечено {formatDate(selectedMessage.replied_at)}
                        </Badge>
                      )}
                    </div>
                    <textarea
                      className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Введите ответ..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReply}
                      disabled={!replyText.trim() || isReplying}
                      className="flex-1"
                    >
                      {isReplying ? (
                        <>
                          <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                          Отправка...
                        </>
                      ) : (
                        <>
                          <Icon name="Send" className="mr-2" size={16} />
                          Отправить на {selectedMessage.email}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Icon name="MailOpen" size={64} className="mb-4 opacity-50" />
                <p className="text-lg">Выберите сообщение для просмотра</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
