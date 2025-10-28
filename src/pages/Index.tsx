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
  const [currentUser, setCurrentUser] = useState<{ email: string; theme: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'platform' | 'game'>('platform');
  const [mainActiveTab, setMainActiveTab] = useState<'streaming' | 'games' | 'files' | 'other'>('streaming');
  const [draggedItem, setDraggedItem] = useState<{id: string; type: 'game' | 'file'} | null>(null);
  const [showVideoDownloader, setShowVideoDownloader] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<FolderItem | null>(null);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setCurrentUser({ email: authForm.email, theme: 'system' });
    setShowAuth(false);
    toast({ title: 'Успешный вход!', description: 'Добро пожаловать в StreamHub' });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setCurrentUser({ email: authForm.email, theme: 'system' });
    setShowAuth(false);
    toast({ title: 'Регистрация успешна!', description: 'Ваш аккаунт создан' });
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
    toast({ title: 'Игра добавлена!', description: `${game.name} успешно добавлена` });
  };

  const handleDragStart = (id: string, type: 'game' | 'file') => {
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string, folderType: 'games' | 'files') => {
    if (!draggedItem) return;

    if (draggedItem.type === 'game' && folderType === 'games') {
      setGames(games.map(g => 
        g.id === draggedItem.id ? { ...g, folderId } : g
      ));
      toast({ title: 'Игра добавлена в папку!' });
    } else if (draggedItem.type === 'file' && folderType === 'files') {
      setFolderItems(folderItems.map(f => 
        f.id === draggedItem.id ? { ...f, folderId } : f
      ));
      toast({ title: 'Файл добавлен в папку!' });
    }

    setDraggedItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      const fileType = file.type.startsWith('image/') ? 'image' :
                       file.type.startsWith('video/') ? 'video' :
                       file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'link';

      const newFile: FolderItem = {
        id: Date.now().toString(),
        name: file.name,
        type: fileType,
        url: URL.createObjectURL(file),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        dateAdded: new Date().toLocaleDateString('ru-RU')
      };

      setFolderItems([...folderItems, newFile]);
      toast({ title: 'Файл загружен!', description: `${file.name} успешно добавлен` });
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
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Icon name="User" size={20} className="mr-2" />
                {currentUser?.email.split('@')[0]}
              </Button>
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
              {platforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="group relative overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => platform.url && window.open(platform.url, '_blank')}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
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
              {games.filter(g => !g.folderId).map((game) => (
                <Card
                  key={game.id}
                  draggable
                  onDragStart={() => handleDragStart(game.id, 'game')}
                  className="group hover:shadow-xl transition-all duration-300 cursor-move"
                  onClick={() => game.url && window.open(game.url, '_blank')}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
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
                <Input type="file" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить файл
                  </label>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folderItems.filter(f => !f.folderId).map((file) => (
                <Card
                  key={file.id}
                  draggable
                  onDragStart={() => handleDragStart(file.id, 'file')}
                  onClick={() => setPreviewFile(file)}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
                        <Icon name={file.type === 'image' ? 'Image' : file.type === 'video' ? 'Video' : 'FileText'} size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
    </div>
  );
};

export default Index;
