import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, FileItem as ApiFileItem } from '@/lib/api';
import { FilePreviewDialog } from '@/components/FilePreviewDialog';
import { ProfileSettings } from '@/components/profile-settings';
import { ActivityLog, addLog, getLoggingEnabled } from '@/components/activity-log';

interface Platform {
  id: string;
  name: string;
  description: string;
  type: 'streaming' | 'social' | 'gaming';
  icon: string;
  gradient: string;
  url?: string;
}

interface Game {
  id: string;
  name: string;
  platform: string;
  url?: string;
  folderId?: string;
}

interface FolderItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'link';
  url?: string;
  content?: string;
  thumbnail?: string;
  folderId?: string;
  size?: string;
  dateAdded?: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'games' | 'files';
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; username: string } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [apiFiles, setApiFiles] = useState<ApiFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedApiFile, setSelectedApiFile] = useState<ApiFileItem | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'platform' | 'game'>('platform');
  const [mainActiveTab, setMainActiveTab] = useState<'streaming' | 'games' | 'files' | 'other'>('streaming');
  const [draggedItem, setDraggedItem] = useState<{id: string; type: 'game' | 'file' | 'platform'} | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showVideoDownloader, setShowVideoDownloader] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<FolderItem | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { toast } = useToast();

  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const saved = localStorage.getItem('streamhub_platforms');
    return saved ? JSON.parse(saved) : [
    {
      id: '1',
      name: 'Twitch',
      description: 'Самая популярная платформа для стриминга игр',
      type: 'streaming',
      icon: 'Gamepad2',
      gradient: 'from-purple-500 to-purple-700',
      url: 'https://twitch.tv'
    },
    {
      id: '2',
      name: 'YouTube Gaming',
      description: 'Игровой раздел YouTube с миллионами стримеров',
      type: 'streaming',
      icon: 'Monitor',
      gradient: 'from-pink-500 to-pink-700',
      url: 'https://youtube.com/gaming'
    },
    {
      id: '3',
      name: 'VK Play Live',
      description: 'Российская платформа для стриминга игр',
      type: 'streaming',
      icon: 'Rocket',
      gradient: 'from-pink-500 to-pink-700',
      url: 'https://vkplay.live'
    }];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('streamhub_folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [folderItems, setFolderItems] = useState<FolderItem[]>(() => {
    const saved = localStorage.getItem('streamhub_folder_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('streamhub_games');
    return saved ? JSON.parse(saved) : [];
  });

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [newPlatform, setNewPlatform] = useState({ name: '', description: '', type: 'streaming' as const, url: '' });
  const [newGame, setNewGame] = useState({ name: '', platform: '', url: '' });

  useEffect(() => {
    localStorage.setItem('streamhub_platforms', JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('streamhub_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('streamhub_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('streamhub_folder_items', JSON.stringify(folderItems));
  }, [folderItems]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      addLog('Проверяю авторизацию...', 'info');
      const result = await api.verifyToken();
      if (result.authenticated && result.user) {
        setIsAuthenticated(true);
        setCurrentUser({ email: result.user.email, username: result.user.username });
        addLog('Авторизация успешна', 'success');
      }
    } catch (error) {
      addLog('Ошибка проверки авторизации', 'error');
      console.error('Auth check failed:', error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      addLog('Загружаю файлы...', 'info');
      const files = await api.getFiles();
      setApiFiles(files);
      addLog(`Загружено файлов: ${files.length}`, 'success');
    } catch (error) {
      addLog('Ошибка загрузки файлов', 'error');
      console.error('Failed to load files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLog('Вход в систему...', 'info');
      const result = await api.login(authForm.email, authForm.password);
      setIsAuthenticated(true);
      setCurrentUser({ email: result.user.email, username: result.user.username });
      setShowAuth(false);
      addLog('Вход выполнен успешно', 'success');
      toast({ title: 'Успешный вход!', description: 'Добро пожаловать в StreamHub' });
    } catch (error) {
      addLog('Ошибка входа', 'error');
      toast({ title: 'Ошибка входа', description: error instanceof Error ? error.message : 'Неверные данные', variant: 'destructive' });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLog('Регистрация аккаунта...', 'info');
      const result = await api.register(authForm.email, authForm.password, authForm.email.split('@')[0]);
      setIsAuthenticated(true);
      setCurrentUser({ email: result.user.email, username: result.user.username });
      setShowAuth(false);
      addLog('Регистрация успешна', 'success');
      toast({ title: 'Регистрация успешна!', description: 'Ваш аккаунт создан' });
    } catch (error) {
      addLog('Ошибка регистрации', 'error');
      toast({ title: 'Ошибка регистрации', description: error instanceof Error ? error.message : 'Не удалось создать аккаунт', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    addLog('Выход из аккаунта', 'info');
    api.clearToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setApiFiles([]);
    setShowProfile(false);
    toast({ title: 'Вы вышли из аккаунта' });
  };

  const handleAddPlatform = () => {
    if (!newPlatform.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название платформы', variant: 'destructive' });
      return;
    }

    const icons = ['Gamepad2', 'Monitor', 'Rocket', 'MessageCircle', 'Star'];
    const gradients = [
      'from-purple-500 to-purple-700',
      'from-blue-500 to-blue-700',
      'from-pink-500 to-pink-700'
    ];

    const platform: Platform = {
      id: Date.now().toString(),
      ...newPlatform,
      icon: icons[Math.floor(Math.random() * icons.length)],
      gradient: gradients[Math.floor(Math.random() * gradients.length)]
    };

    setPlatforms([...platforms, platform]);
    setNewPlatform({ name: '', description: '', type: 'streaming', url: '' });
    setShowAddContent(false);
    addLog(`Платформа "${platform.name}" добавлена`, 'success');
    toast({ title: 'Платформа добавлена!', description: `${platform.name} успешно добавлена` });
  };

  const handleAddGame = () => {
    if (!newGame.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название игры', variant: 'destructive' });
      return;
    }

    const game: Game = {
      id: Date.now().toString(),
      ...newGame
    };

    setGames([...games, game]);
    setNewGame({ name: '', platform: '', url: '' });
    setShowAddContent(false);
    addLog(`Игра "${game.name}" добавлена`, 'success');
    toast({ title: 'Игра добавлена!', description: `${game.name} успешно добавлена` });
  };

  const handleDragStart = (id: string, type: 'game' | 'file' | 'platform') => {
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDrop = (folderId: string, folderType: 'games' | 'files') => {
    if (!draggedItem) return;

    if (draggedItem.type === 'game' && folderType === 'games') {
      setGames(games.map(g => 
        g.id === draggedItem.id ? { ...g, folderId } : g
      ));
      addLog('Игра добавлена в папку', 'success');
      toast({ title: 'Игра добавлена в папку!' });
    } else if (draggedItem.type === 'file' && folderType === 'files') {
      setFolderItems(folderItems.map(f => 
        f.id === draggedItem.id ? { ...f, folderId } : f
      ));
      addLog('Файл добавлен в папку', 'success');
      toast({ title: 'Файл добавлен в папку!' });
    }

    setDraggedItem(null);
  };

  const handleReorder = (targetIndex: number) => {
    if (!draggedItem || dragOverIndex === null) return;

    if (draggedItem.type === 'platform') {
      const currentIndex = platforms.findIndex(p => p.id === draggedItem.id);
      if (currentIndex === -1 || currentIndex === targetIndex) return;

      const newPlatforms = [...platforms];
      const [removed] = newPlatforms.splice(currentIndex, 1);
      newPlatforms.splice(targetIndex, 0, removed);
      setPlatforms(newPlatforms);
      addLog('Платформа перемещена', 'success');
    } else if (draggedItem.type === 'game') {
      const currentIndex = games.findIndex(g => g.id === draggedItem.id);
      if (currentIndex === -1 || currentIndex === targetIndex) return;

      const newGames = [...games];
      const [removed] = newGames.splice(currentIndex, 1);
      newGames.splice(targetIndex, 0, removed);
      setGames(newGames);
      addLog('Игра перемещена', 'success');
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDeletePlatform = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlatforms(platforms.filter(p => p.id !== id));
    addLog(`Платформа "${name}" удалена`, 'warning');
    toast({ title: 'Удалено', description: `${name} удалена` });
  };

  const handleDeleteGame = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGames(games.filter(g => g.id !== id));
    addLog(`Игра "${name}" удалена`, 'warning');
    toast({ title: 'Удалено', description: `${name} удалена` });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast({ title: 'Войдите в аккаунт', description: 'Для загрузки файлов необходима авторизация', variant: 'destructive' });
      setShowAuth(true);
      return;
    }

    setUploadedFile(file);
    addLog(`Загружаю файл ${file.name}...`, 'info');
    toast({ title: 'Загрузка...', description: `Загружаем ${file.name}` });

    try {
      await api.uploadFile(file);
      await loadFiles();
      addLog(`Файл ${file.name} загружен`, 'success');
      toast({ title: 'Файл загружен!', description: `${file.name} успешно добавлен в ваш аккаунт` });
    } catch (error) {
      addLog(`Ошибка загрузки ${file.name}`, 'error');
      toast({ title: 'Ошибка загрузки', description: error instanceof Error ? error.message : 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploadedFile(null);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-purple-600 to-purple-800 backdrop-blur supports-[backdrop-filter]:bg-purple-600/95">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">StreamHub</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Icon name="Globe" size={20} />
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:bg-white/20">
                    <Icon name="User" size={20} className="mr-2" />
                    {currentUser?.username || currentUser?.email.split('@')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowProfile(true)}>
                    <Icon name="Settings" size={16} className="mr-2" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => setShowAuth(true)}>
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowVideoDownloader(true)}>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать видео
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs value={mainActiveTab} onValueChange={(v) => setMainActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-muted/50">
            <TabsTrigger value="streaming" className="flex items-center gap-2">
              <Icon name="Monitor" size={16} />
              Стриминг
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Icon name="Gamepad2" size={16} />
              Игры
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Icon name="FolderOpen" size={16} />
              Файлы
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Icon name="LayoutGrid" size={16} />
              Другое
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaming" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Стриминговые платформы</h2>
              <Button onClick={() => { setActiveAddTab('platform'); setShowAddContent(true); }}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform, index) => (
                <Card
                  key={platform.id}
                  draggable
                  onDragStart={() => handleDragStart(platform.id, 'platform')}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleReorder(index)}
                  className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-move ${
                    dragOverIndex === index && draggedItem?.type === 'platform' ? 'border-primary scale-105' : 'hover:border-primary'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative p-6">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity">
                      <Icon name="GripVertical" size={20} className="text-muted-foreground" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => handleDeletePlatform(platform.id, platform.name, e)}
                    >
                      <Icon name="Trash2" size={16} className="text-destructive" />
                    </Button>
                    <div className="flex items-start gap-4" onClick={() => platform.url && window.open(platform.url, '_blank')}>
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${platform.gradient}`}>
                        <Icon name={platform.icon as any} size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Игры</h2>
              <Button onClick={() => { setActiveAddTab('game'); setShowAddContent(true); }}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.filter(g => !g.folderId).map((game, index) => (
                <Card
                  key={game.id}
                  draggable
                  onDragStart={() => handleDragStart(game.id, 'game')}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleReorder(index)}
                  className={`group relative hover:shadow-xl transition-all duration-300 cursor-move border-2 ${
                    dragOverIndex === index && draggedItem?.type === 'game' ? 'border-primary scale-105' : 'border-transparent'
                  }`}
                >
                  <div className="p-6">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity">
                      <Icon name="GripVertical" size={20} className="text-muted-foreground" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => handleDeleteGame(game.id, game.name, e)}
                    >
                      <Icon name="Trash2" size={16} className="text-destructive" />
                    </Button>
                    <div className="flex items-start gap-4" onClick={() => game.url && window.open(game.url, '_blank')}>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                        <Icon name="Gamepad2" size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">{game.platform}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Файлы</h2>
              <div className="flex gap-2">
                <Input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" disabled={uploadedFile !== null} />
                <Button asChild disabled={uploadedFile !== null}>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Icon name={uploadedFile ? "Loader2" : "Upload"} size={16} className={`mr-2 ${uploadedFile ? 'animate-spin' : ''}`} />
                    {uploadedFile ? 'Загрузка...' : 'Загрузить файл'}
                  </label>
                </Button>
              </div>
            </div>

            {isLoadingFiles ? (
              <div className="flex justify-center items-center py-12">
                <Icon name="Loader2" size={48} className="animate-spin text-primary" />
              </div>
            ) : apiFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-muted inline-block mb-4">
                  <Icon name="FileQuestion" size={64} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Нет файлов</h3>
                <p className="text-muted-foreground mb-4">
                  {isAuthenticated ? 'Загрузите первый файл' : 'Войдите в аккаунт для управления файлами'}
                </p>
                {!isAuthenticated && (
                  <Button onClick={() => setShowAuth(true)}>
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Войти
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiFiles.map((file) => {
                  const getFileIcon = (mimeType: string) => {
                    if (mimeType.startsWith('image/')) return 'Image';
                    if (mimeType.startsWith('video/')) return 'Video';
                    if (mimeType.includes('pdf')) return 'FileText';
                    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
                    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
                    return 'File';
                  };

                  const formatSize = (bytes: number) => {
                    if (bytes < 1024) return `${bytes} B`;
                    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
                    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
                  };

                  return (
                    <Card
                      key={file.id}
                      onClick={() => setSelectedApiFile(file)}
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-primary"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
                            <Icon name={getFileIcon(file.mime_type) as any} size={24} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold mb-1 truncate" title={file.original_filename}>{file.original_filename}</h3>
                            <p className="text-sm text-muted-foreground">{formatSize(file.file_size)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="other">
            <div className="text-center py-12">
              <Icon name="Package" size={64} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-2xl font-bold mb-2">Скоро здесь появится что-то интересное</h3>
              <p className="text-muted-foreground">Следите за обновлениями!</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Вход в StreamHub</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Войти</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Пароль</Label>
                  <Input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddContent} onOpenChange={setShowAddContent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить контент</DialogTitle>
          </DialogHeader>
          <Tabs value={activeAddTab} onValueChange={(v) => setActiveAddTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platform">Платформа</TabsTrigger>
              <TabsTrigger value="game">Игра</TabsTrigger>
            </TabsList>
            <TabsContent value="platform" className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                  placeholder="YouTube, Twitch..."
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Input
                  value={newPlatform.description}
                  onChange={(e) => setNewPlatform({ ...newPlatform, description: e.target.value })}
                  placeholder="Краткое описание"
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newPlatform.url}
                  onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAddPlatform} className="w-full">Добавить платформу</Button>
            </TabsContent>
            <TabsContent value="game" className="space-y-4">
              <div>
                <Label>Название игры</Label>
                <Input
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                  placeholder="Dota 2, CS:GO..."
                />
              </div>
              <div>
                <Label>Платформа</Label>
                <Input
                  value={newGame.platform}
                  onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                  placeholder="Steam, Epic Games..."
                />
              </div>
              <div>
                <Label>URL</Label>
                <Input
                  value={newGame.url}
                  onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAddGame} className="w-full">Добавить игру</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDownloader} onOpenChange={setShowVideoDownloader}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Скачать видео</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL видео</Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <Button className="w-full">
              <Icon name="Download" size={16} className="mr-2" />
              Скачать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        file={selectedApiFile}
        isOpen={!!selectedApiFile}
        onClose={() => setSelectedApiFile(null)}
      />

      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewFile.type === 'image' && previewFile.url && (
                <img src={previewFile.url} alt={previewFile.name} className="w-full rounded-lg" />
              )}
              {previewFile.type === 'video' && previewFile.url && (
                <video src={previewFile.url} controls className="w-full rounded-lg" />
              )}
              <div className="flex gap-2">
                <Button onClick={() => previewFile.url && window.open(previewFile.url, '_blank')}>
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Открыть
                </Button>
                <Button variant="outline" onClick={() => {
                  if (previewFile.url) {
                    const a = document.createElement('a');
                    a.href = previewFile.url;
                    a.download = previewFile.name;
                    a.click();
                  }
                }}>
                  <Icon name="Download" size={16} className="mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <ProfileSettings 
            onLogout={handleLogout}
            onAccountDeleted={() => {
              handleLogout();
              setShowProfile(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {getLoggingEnabled() && (
        <div className="fixed bottom-6 right-6 w-96 z-50">
          <ActivityLog maxEntries={50} />
        </div>
      )}
    </div>
  );
};

export default Index;