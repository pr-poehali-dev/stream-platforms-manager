import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  const [showProfile, setShowProfile] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'platform' | 'game' | 'folder' | 'file'>('platform');
  const [mainActiveTab, setMainActiveTab] = useState<'streaming' | 'games' | 'files' | 'other'>('streaming');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{id: string; type: 'game' | 'file'} | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showVideoDownloader, setShowVideoDownloader] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  const [showWallpaperSettings, setShowWallpaperSettings] = useState(false);
  const [wallpaperTheme, setWallpaperTheme] = useState<'light' | 'dark' | 'custom'>('light');
  const [customWallpaper, setCustomWallpaper] = useState('');
  const [searchEngine, setSearchEngine] = useState<'google' | 'yandex' | 'bing'>('google');
  const { toast } = useToast();

  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    const saved = localStorage.getItem('streamhub_platforms');
    return saved ? JSON.parse(saved) : [
    {
      id: '1',
      name: 'Twitch',
      description: 'Самая популярная платформа для стриминга игр',
      type: 'streaming',
      icon: '🎮',
      gradient: 'from-purple-500 to-purple-700',
      url: 'https://twitch.tv'
    },
    {
      id: '2',
      name: 'YouTube Gaming',
      description: 'Игровой раздел YouTube с миллионами стримеров',
      type: 'streaming',
      icon: '📺',
      gradient: 'from-pink-500 to-pink-700',
      url: 'https://youtube.com/gaming'
    },
    {
      id: '3',
      name: 'Steam',
      description: 'Крупнейшая цифровая платформа для PC игр',
      type: 'gaming',
      icon: '⚡',
      gradient: 'from-blue-500 to-blue-700',
      url: 'https://store.steampowered.com'
    },
    {
      id: '4',
      name: 'Discord',
      description: 'Общение с геймерами и стримерами',
      type: 'social',
      icon: '💬',
      gradient: 'from-green-400 to-green-600',
      url: 'https://discord.com'
    },
    {
      id: '5',
      name: 'VK Play Live',
      description: 'Российская платформа для стриминга игр',
      type: 'streaming',
      icon: '🚀',
      gradient: 'from-pink-500 to-pink-700',
      url: 'https://vkplay.live'
    },
    {
      id: '6',
      name: 'Boosty',
      description: 'Платформа для монетизации контента',
      type: 'social',
      icon: '⭐',
      gradient: 'from-green-500 to-green-700',
      url: 'https://boosty.to'
    },
    {
      id: '7',
      name: 'VPN',
      description: 'Бесплатный VPN для безопасного доступа',
      type: 'social',
      icon: '🔒',
      gradient: 'from-green-500 to-green-700',
      url: '#'
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

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFileFolder, setSelectedFileFolder] = useState<string | null>(null);

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('streamhub_games');
    return saved ? JSON.parse(saved) : [
    { id: '1', name: 'Dota 2', platform: 'Steam', url: 'https://store.steampowered.com/app/570/Dota_2/' },
    { id: '2', name: 'CS:GO', platform: 'Steam', url: 'https://store.steampowered.com/app/730/CounterStrike_2/' },
    { id: '3', name: 'Valorant', platform: 'Riot', url: 'https://playvalorant.com/ru-ru/' },
    { id: '4', name: 'League of Legends', platform: 'Riot', url: 'https://www.leagueoflegends.com/ru-ru/' },
    { id: '5', name: 'Fortnite', platform: 'Epic', url: 'https://www.fortnite.com/' },
    { id: '6', name: 'Minecraft', platform: 'Mojang', url: 'https://www.minecraft.net/' }];
  });

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [newPlatform, setNewPlatform] = useState({ name: '', description: '', type: 'streaming' as const, url: '' });
  const [newGame, setNewGame] = useState({ name: '', platform: '', url: '' });
  const [newFolder, setNewFolder] = useState({ name: '', icon: '📁', color: 'from-blue-500 to-blue-700', type: 'games' as 'games' | 'files' });
  const [newFolderItem, setNewFolderItem] = useState({ name: '', type: 'link' as 'image' | 'video' | 'document' | 'link', url: '', content: '' });

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

    const icons = ['🎮', '📺', '⚡', '💬', '🚀', '⭐', '🎯', '🎪', '🎨', '🎭'];
    const gradients = [
      'from-purple-500 to-purple-700',
      'from-blue-500 to-blue-700',
      'from-green-500 to-green-700',
      'from-orange-500 to-orange-700',
      'from-pink-500 to-pink-700'
    ];

    const platform: Platform = {
      id: Date.now().toString(),
      name: newPlatform.name,
      description: newPlatform.description,
      type: newPlatform.type,
      icon: icons[Math.floor(Math.random() * icons.length)],
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
      url: newPlatform.url
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
      name: newGame.name,
      platform: newGame.platform || 'Разное',
      url: newGame.url,
      folderId: selectedFolder || undefined
    };
    setGames([...games, game]);
    setNewGame({ name: '', platform: '', url: '' });
    setShowAddContent(false);
    toast({ title: 'Игра добавлена!', description: `${game.name} успешно добавлена` });
  };

  const handleAddFolder = () => {
    if (!newFolder.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название папки', variant: 'destructive' });
      return;
    }

    const folder: Folder = {
      id: Date.now().toString(),
      name: newFolder.name,
      icon: newFolder.icon,
      color: newFolder.color,
      type: newFolder.type
    };
    setFolders([...folders, folder]);
    setNewFolder({ name: '', icon: '📁', color: 'from-blue-500 to-blue-700', type: 'games' });
    setShowAddContent(false);
    toast({ title: 'Папка создана!', description: `${folder.name} успешно создана` });
  };

  const handleAddFolderItem = () => {
    if (!newFolderItem.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название', variant: 'destructive' });
      return;
    }

    const item: FolderItem = {
      id: Date.now().toString(),
      name: newFolderItem.name,
      type: newFolderItem.type,
      url: newFolderItem.url,
      content: newFolderItem.content,
      folderId: selectedFileFolder || undefined
    };
    setFolderItems([...folderItems, item]);
    setNewFolderItem({ name: '', type: 'link', url: '', content: '' });
    setShowAddContent(false);
    toast({ title: 'Файл добавлен!', description: `${item.name} успешно добавлен` });
  };

  const handleDrop = (folderId: string | null, itemType: 'game' | 'file') => {
    if (!draggedItem || draggedItem.type !== itemType) return;

    if (itemType === 'game') {
      setGames(games.map(g => 
        g.id === draggedItem.id ? { ...g, folderId: folderId || undefined } : g
      ));
    } else {
      setFolderItems(folderItems.map(item => 
        item.id === draggedItem.id ? { ...item, folderId: folderId || undefined } : item
      ));
    }
    
    setDraggedItem(null);
    toast({ title: 'Перемещено!', description: folderId ? 'Файл перемещен в папку' : 'Файл убран из папки' });
  };

  const handleDeleteAccount = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowProfile(false);
    toast({ title: 'Аккаунт удален', description: 'Ваш аккаунт был успешно удален' });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowProfile(false);
    toast({ title: 'Вы вышли из аккаунта', description: 'До скорой встречи!' });
  };

  const streamingPlatforms = platforms.filter(p => p.type === 'streaming');
  const userPlatforms = platforms.filter(p => p.type !== 'streaming');

  if (!isAuthenticated && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAuth(false)}
            className="absolute top-4 right-4 hover:bg-white/20"
          >
            <Icon name="X" size={20} />
          </Button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
              <span className="text-3xl">🎮</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">StreamHub</h1>
            <p className="text-muted-foreground">Управление стримами и играми</p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
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
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  const MainContent = () => (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} ${activeView === 'mobile' ? 'pb-20' : ''}`}>
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-2xl w-12 h-12"
                >
                  <Icon name="Globe" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => {
                  setSearchEngine('google');
                  window.open('https://www.google.com', '_blank');
                }}>
                  <Icon name="Globe" size={16} className="mr-2" />
                  Google
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSearchEngine('yandex');
                  window.open('https://ya.ru', '_blank');
                }}>
                  <Icon name="Globe" size={16} className="mr-2" />
                  Яндекс
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSearchEngine('bing');
                  window.open('https://www.bing.com', '_blank');
                }}>
                  <Icon name="Globe" size={16} className="mr-2" />
                  Bing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="text-white hover:bg-white/20 rounded-2xl w-12 h-12"
              >
                <Icon name="Search" size={20} />
              </Button>
              
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfile(true)}
                  className="text-white hover:bg-white/20 rounded-full w-12 h-12"
                >
                  <Icon name="User" size={24} />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowAuth(true)}
                  className="text-white hover:bg-white/20 rounded-2xl h-12 px-6"
                >
                  <Icon name="LogIn" size={20} className="mr-2" />
                  Войти
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-2xl w-14 h-14"
                  >
                    <Icon name="MoreVertical" size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isAuthenticated && (
                    <DropdownMenuItem onClick={() => setShowProfile(true)}>
                      <Icon name="User" size={16} className="mr-2" />
                      Профиль
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowVideoDownloader(true)}>
                    <Icon name="Download" size={16} className="mr-2" />
                    Загрузки видео
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowWallpaperSettings(true)}>
                    <Icon name="Palette" size={16} className="mr-2" />
                    Выбор тем
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setActiveAddTab('platform');
                    setShowAddContent(true);
                  }}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Icon name="Settings" size={16} className="mr-2" />
                      Режим для телефона или ПК
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setActiveView('desktop')}>
                        <Icon name="Monitor" size={16} className="mr-2" />
                        ПК
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveView('mobile')}>
                        <Icon name="Smartphone" size={16} className="mr-2" />
                        Телефон
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-8 ${activeView === 'mobile' ? 'max-w-md' : ''}`}>
        <Tabs value={mainActiveTab} onValueChange={(v) => setMainActiveTab(v as 'streaming' | 'games' | 'files' | 'other')} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="streaming" className="text-base">
              <Icon name="Tv" size={18} className="mr-2" />
              Стриминг
            </TabsTrigger>
            <TabsTrigger value="games" className="text-base">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Игры {folders.filter(f => f.type === 'games').length > 0 && <Badge className="ml-2" variant="secondary">{folders.filter(f => f.type === 'games').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="files" className="text-base">
              <Icon name="FolderOpen" size={18} className="mr-2" />
              Файлы {folders.filter(f => f.type === 'files').length > 0 && <Badge className="ml-2" variant="secondary">{folders.filter(f => f.type === 'files').length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="other" className="text-base">
              <Icon name="Grid3x3" size={18} className="mr-2" />
              Другое
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaming">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Стриминговые платформы</h2>
                <Button onClick={() => {
                  setActiveAddTab('platform');
                  setShowAddContent(true);
                }} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {streamingPlatforms.map((platform) => (
              <div key={platform.id} className="group relative">
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0">
                    <div className="p-4 flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                        <span className="text-3xl">{platform.icon}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{platform.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{platform.description}</p>
                    </div>
                  </Card>
                </a>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setPlatforms(platforms.filter(p => p.id !== platform.id));
                    toast({ title: 'Платформа удалена', description: `${platform.name} удалена из списка` });
                  }}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
            ))}
          </div>
            </div>
          </TabsContent>

          <TabsContent value="games">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Игры и папки</h2>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setActiveAddTab('folder');
                    setShowAddContent(true);
                  }} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Icon name="FolderPlus" size={16} className="mr-2" />
                    Папка
                  </Button>
                  <Button onClick={() => {
                    setActiveAddTab('game');
                    setShowAddContent(true);
                  }} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Игру
                  </Button>
                </div>
              </div>

              {folders.filter(f => f.type === 'games').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Папки игр</h3>
                    <Badge variant="secondary">{folders.filter(f => f.type === 'games').length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedFolder === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFolder(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(null, 'game')}
                      className="h-9"
                    >
                      <Icon name="Folder" size={14} className="mr-2" />
                      Все игры
                      <Badge className="ml-2" variant="secondary">{games.length}</Badge>
                    </Button>
                    {folders.filter(f => f.type === 'games').map((folder) => {
                      const folderGamesCount = games.filter(g => g.folderId === folder.id).length;
                      return (
                        <div key={folder.id} className="relative group">
                          <Button
                            variant={selectedFolder === folder.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedFolder(folder.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(folder.id, 'game')}
                            className="h-9"
                          >
                            <span className="mr-2">{folder.icon}</span>
                            {folder.name}
                            <Badge className="ml-2" variant="secondary">{folderGamesCount}</Badge>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setFolders(folders.filter(f => f.id !== folder.id));
                              toast({ title: 'Папка удалена', description: `${folder.name} удалена` });
                            }}
                          >
                            <Icon name="X" size={12} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {games.filter(game => selectedFolder === null || game.folderId === selectedFolder).map((game) => (
              <div 
                key={game.id} 
                className="group relative"
                draggable
                onDragStart={() => setDraggedItem({id: game.id, type: 'game'})}
                onDragEnd={() => setDraggedItem(null)}
              >
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0">
                    <div className="p-4 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <span className="text-3xl">🎮</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{game.name}</h3>
                      <p className="text-xs text-muted-foreground">{game.platform}</p>
                    </div>
                  </Card>
                </a>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setGames(games.filter(g => g.id !== game.id));
                    toast({ title: 'Игра удалена', description: `${game.name} удалена из списка` });
                  }}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Мои файлы</h2>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setNewFolder({ ...newFolder, type: 'files' });
                    setActiveAddTab('folder');
                    setShowAddContent(true);
                  }} variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    <Icon name="FolderPlus" size={16} className="mr-2" />
                    Папка
                  </Button>
                  <Button onClick={() => {
                    setActiveAddTab('file');
                    setShowAddContent(true);
                  }} className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Файл
                  </Button>
                </div>
              </div>

              {folders.filter(f => f.type === 'files').length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">Папки</h3>
                    <Badge variant="secondary">{folders.filter(f => f.type === 'files').length}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedFileFolder === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFileFolder(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(null, 'file')}
                      className="h-9"
                    >
                      <Icon name="Folder" size={14} className="mr-2" />
                      Все файлы
                      <Badge className="ml-2" variant="secondary">{folderItems.length}</Badge>
                    </Button>
                    {folders.filter(f => f.type === 'files').map((folder) => {
                      const folderItemsCount = folderItems.filter(item => item.folderId === folder.id).length;
                      return (
                        <div key={folder.id} className="relative group">
                          <Button
                            variant={selectedFileFolder === folder.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedFileFolder(folder.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(folder.id, 'file')}
                            className="h-9"
                          >
                            <span className="mr-2">{folder.icon}</span>
                            {folder.name}
                            <Badge className="ml-2" variant="secondary">{folderItemsCount}</Badge>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setFolders(folders.filter(f => f.id !== folder.id));
                              toast({ title: 'Папка удалена', description: `${folder.name} удалена` });
                            }}
                          >
                            <Icon name="X" size={12} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {folderItems.filter(item => selectedFileFolder === null || item.folderId === selectedFileFolder).map((item) => {
                  const typeIcons = {
                    image: '🖼️',
                    video: '🎬',
                    document: '📄',
                    link: '🔗'
                  };
                  const typeColors = {
                    image: 'from-pink-500 to-pink-700',
                    video: 'from-purple-500 to-purple-700',
                    document: 'from-blue-500 to-blue-700',
                    link: 'from-green-500 to-green-700'
                  };
                  
                  return (
                    <div 
                      key={item.id} 
                      className="group relative"
                      draggable
                      onDragStart={() => setDraggedItem({id: item.id, type: 'file'})}
                      onDragEnd={() => setDraggedItem(null)}
                    >
                      <a
                        href={item.url || '#'}
                        target={item.url ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="block"
                        onClick={(e) => !item.url && e.preventDefault()}
                      >
                        <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-move border-0">
                          <div className="p-4 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 bg-gradient-to-br ${typeColors[item.type]} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                              <span className="text-3xl">{typeIcons[item.type]}</span>
                            </div>
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground capitalize">{item.type === 'image' ? 'Изображение' : item.type === 'video' ? 'Видео' : item.type === 'document' ? 'Документ' : 'Ссылка'}</p>
                          </div>
                        </Card>
                      </a>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          setFolderItems(folderItems.filter(i => i.id !== item.id));
                          toast({ title: 'Файл удален', description: `${item.name} удален из списка` });
                        }}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="other">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Другие платформы</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {userPlatforms.map((platform) => (
              <div key={platform.id} className="group relative">
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0">
                    <div className="p-4 flex flex-col items-center text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                        <span className="text-3xl">{platform.icon}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{platform.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{platform.description}</p>
                    </div>
                  </Card>
                </a>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setPlatforms(platforms.filter(p => p.id !== platform.id));
                    toast({ title: 'Платформа удалена', description: `${platform.name} удалена из списка` });
                  }}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
              ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showAddContent} onOpenChange={setShowAddContent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить контент</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeAddTab} onValueChange={(v) => setActiveAddTab(v as 'platform' | 'game' | 'folder' | 'file')}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="platform">Платформа</TabsTrigger>
              <TabsTrigger value="game">Игра</TabsTrigger>
              <TabsTrigger value="file">Файл</TabsTrigger>
              <TabsTrigger value="folder">Папка</TabsTrigger>
            </TabsList>

            <TabsContent value="platform" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Название</Label>
                <Input
                  id="platform-name"
                  placeholder="Название платформы"
                  value={newPlatform.name}
                  onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-desc">Описание</Label>
                <Input
                  id="platform-desc"
                  placeholder="Краткое описание"
                  value={newPlatform.description}
                  onChange={(e) => setNewPlatform({ ...newPlatform, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">URL (необязательно)</Label>
                <Input
                  id="platform-url"
                  placeholder="https://..."
                  value={newPlatform.url}
                  onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-type">Тип</Label>
                <select
                  id="platform-type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newPlatform.type}
                  onChange={(e) => setNewPlatform({ ...newPlatform, type: e.target.value as 'streaming' | 'social' | 'gaming' })}
                >
                  <option value="streaming">Стриминг</option>
                  <option value="social">Социальная сеть</option>
                  <option value="gaming">Игровая</option>
                </select>
              </div>
              <Button onClick={handleAddPlatform} className="w-full">Добавить платформу</Button>
            </TabsContent>

            <TabsContent value="game" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="game-name">Название игры</Label>
                <Input
                  id="game-name"
                  placeholder="Название игры"
                  value={newGame.name}
                  onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-platform">Платформа</Label>
                <Input
                  id="game-platform"
                  placeholder="Steam, PC, PlayStation и т.д."
                  value={newGame.platform}
                  onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="game-url">Ссылка на игру</Label>
                <Input
                  id="game-url"
                  placeholder="https://..."
                  value={newGame.url}
                  onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                />
              </div>
              {folders.filter(f => f.type === 'games').length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="game-folder">Папка (необязательно)</Label>
                  <select
                    id="game-folder"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={selectedFolder || ''}
                    onChange={(e) => setSelectedFolder(e.target.value || null)}
                  >
                    <option value="">Без папки</option>
                    {folders.filter(f => f.type === 'games').map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.icon} {folder.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button onClick={handleAddGame} className="w-full">Добавить игру</Button>
            </TabsContent>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="file-name">Название</Label>
                <Input
                  id="file-name"
                  placeholder="Мой файл"
                  value={newFolderItem.name}
                  onChange={(e) => setNewFolderItem({ ...newFolderItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-type">Тип файла</Label>
                <select
                  id="file-type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newFolderItem.type}
                  onChange={(e) => setNewFolderItem({ ...newFolderItem, type: e.target.value as 'image' | 'video' | 'document' | 'link' })}
                >
                  <option value="link">🔗 Ссылка</option>
                  <option value="image">🖼️ Изображение</option>
                  <option value="video">🎬 Видео</option>
                  <option value="document">📄 Документ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-upload">Прикрепить файл</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept={newFolderItem.type === 'image' ? 'image/*' : newFolderItem.type === 'video' ? 'video/*' : newFolderItem.type === 'document' ? '.pdf,.doc,.docx,.txt' : '*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const fileUrl = event.target?.result as string;
                        setNewFolderItem({ 
                          ...newFolderItem, 
                          url: fileUrl,
                          name: newFolderItem.name || file.name
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Или укажите URL ниже
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file-url">URL (необязательно)</Label>
                <Input
                  id="file-url"
                  placeholder="https://..."
                  value={newFolderItem.url}
                  onChange={(e) => setNewFolderItem({ ...newFolderItem, url: e.target.value })}
                />
              </div>
              {folders.filter(f => f.type === 'files').length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="file-folder">Папка (необязательно)</Label>
                  <select
                    id="file-folder"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={selectedFileFolder || ''}
                    onChange={(e) => setSelectedFileFolder(e.target.value || null)}
                  >
                    <option value="">Без папки</option>
                    {folders.filter(f => f.type === 'files').map((folder) => (
                      <option key={folder.id} value={folder.id}>{folder.icon} {folder.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <Button onClick={handleAddFolderItem} className="w-full">Добавить файл</Button>
            </TabsContent>

            <TabsContent value="folder" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="folder-type">Тип папки</Label>
                <select
                  id="folder-type"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newFolder.type}
                  onChange={(e) => setNewFolder({ ...newFolder, type: e.target.value as 'games' | 'files' })}
                >
                  <option value="games">🎮 Папка для игр</option>
                  <option value="files">📁 Папка для файлов</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder-name">Название папки</Label>
                <Input
                  id="folder-name"
                  placeholder={newFolder.type === 'games' ? 'Мои игры' : 'Мои файлы'}
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folder-icon">Иконка</Label>
                <div className="grid grid-cols-6 gap-2">
                  {['📁', '🎮', '🎯', '⭐', '🔥', '💥', '⚡', '🏆', '👑', '🎉', '🚀', '🎭'].map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={newFolder.icon === icon ? 'default' : 'outline'}
                      className="text-2xl h-12"
                      onClick={() => setNewFolder({ ...newFolder, icon })}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цвет</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Синий', value: 'from-blue-500 to-blue-700' },
                    { name: 'Фиолетовый', value: 'from-purple-500 to-purple-700' },
                    { name: 'Зеленый', value: 'from-green-500 to-green-700' },
                    { name: 'Красный', value: 'from-red-500 to-red-700' },
                    { name: 'Оранжевый', value: 'from-orange-500 to-orange-700' },
                    { name: 'Розовый', value: 'from-pink-500 to-pink-700' },
                  ].map((color) => (
                    <Button
                      key={color.value}
                      type="button"
                      variant={newFolder.color === color.value ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => setNewFolder({ ...newFolder, color: color.value })}
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.value}`} />
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddFolder} className="w-full">Создать папку</Button>
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
            <div className="space-y-2">
              <Label htmlFor="video-url">Вставьте ссылку на видео</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Поддерживается: YouTube, ВКонтакте, TikTok, RuTube, Instagram, Facebook, Twitch и другие
              </p>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              onClick={() => {
                if (videoUrl) {
                  window.open(`https://ru.get-save.com/1-1/?url=${encodeURIComponent(videoUrl)}`, '_blank');
                  toast({ title: 'Открываем загрузчик', description: 'Универсальный сервис Get-Save.com' });
                } else {
                  toast({ title: 'Введите ссылку', description: 'Вставьте URL видео', variant: 'destructive' });
                }
              }}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Скачать видео
            </Button>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">Или выберите сервис:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://ru.get-save.com/1-1/" target="_blank" rel="noopener noreferrer">
                    <Icon name="Download" size={14} className="mr-2" />
                    Универсальный
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://ru.savefrom.net/" target="_blank" rel="noopener noreferrer">
                    <Icon name="Youtube" size={14} className="mr-2" />
                    YouTube
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tikvideo.app/ru" target="_blank" rel="noopener noreferrer">
                    <Icon name="Music" size={14} className="mr-2" />
                    TikTok
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://video-saver.ru/" target="_blank" rel="noopener noreferrer">
                    <Icon name="Play" size={14} className="mr-2" />
                    RuTube
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://untwitch.com/" target="_blank" rel="noopener noreferrer">
                    <Icon name="Tv" size={14} className="mr-2" />
                    Twitch
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Поиск</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                <Icon name="Search" size={20} className="mr-3" />
                Поиск Google
                <Icon name="ExternalLink" size={14} className="ml-auto" />
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://yandex.ru" target="_blank" rel="noopener noreferrer">
                <Icon name="Search" size={20} className="mr-3" />
                Поиск Яндекс
                <Icon name="ExternalLink" size={14} className="ml-auto" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Профиль</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser?.email || ''} disabled />
            </div>

            <div className="space-y-4">
              <Label>Тема оформления</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Темная тема</span>
                  <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Изменить пароль</Label>
              <Input type="password" placeholder="Новый пароль" />
            </div>

            <div className="space-y-2">
              <Label>Изменить email</Label>
              <Input type="email" placeholder="Новый email" />
            </div>

            <Button 
              className="w-full"
              onClick={() => {
                toast({ title: 'Данные сохранены!', description: 'Ваши изменения успешно применены' });
              }}
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить данные
            </Button>

            <div className="pt-4 border-t space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти из аккаунта
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDeleteAccount}
              >
                <Icon name="Trash2" size={16} className="mr-2" />
                Удалить аккаунт
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWallpaperSettings} onOpenChange={setShowWallpaperSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Настройка фона сайта</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="themes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="themes">Темы</TabsTrigger>
              <TabsTrigger value="custom">Свой фон</TabsTrigger>
              <TabsTrigger value="gallery">Галерея</TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${wallpaperTheme === 'light' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setWallpaperTheme('light');
                    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    toast({ title: 'Светлая тема применена', description: 'Градиент фиолетово-синий' });
                  }}
                >
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 mb-3"></div>
                  <h3 className="font-semibold">Светлая тема</h3>
                  <p className="text-sm text-muted-foreground">Классический градиент</p>
                </Card>

                <Card 
                  className={`p-6 cursor-pointer transition-all hover:scale-105 ${wallpaperTheme === 'dark' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    setWallpaperTheme('dark');
                    document.body.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)';
                    toast({ title: 'Темная тема применена', description: 'Глубокий синий градиент' });
                  }}
                >
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-blue-900 to-slate-900 mb-3"></div>
                  <h3 className="font-semibold">Темная тема</h3>
                  <p className="text-sm text-muted-foreground">Ночной режим</p>
                </Card>

                <Card 
                  className="p-6 cursor-pointer transition-all hover:scale-105"
                  onClick={() => {
                    document.body.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                    toast({ title: 'Тема применена', description: 'Розовый закат' });
                  }}
                >
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-pink-400 to-red-500 mb-3"></div>
                  <h3 className="font-semibold">Розовый закат</h3>
                  <p className="text-sm text-muted-foreground">Теплые оттенки</p>
                </Card>

                <Card 
                  className="p-6 cursor-pointer transition-all hover:scale-105"
                  onClick={() => {
                    document.body.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
                    toast({ title: 'Тема применена', description: 'Зеленая свежесть' });
                  }}
                >
                  <div className="w-full h-32 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 mb-3"></div>
                  <h3 className="font-semibold">Зеленая свежесть</h3>
                  <p className="text-sm text-muted-foreground">Природные тона</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Вставьте URL изображения</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={customWallpaper}
                    onChange={(e) => setCustomWallpaper(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Поддерживаются форматы: JPG, PNG, WebP, GIF
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Или загрузите файл</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const imageUrl = event.target?.result as string;
                          setCustomWallpaper(imageUrl);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {customWallpaper && (
                  <div className="space-y-3">
                    <Label>Предпросмотр:</Label>
                    <div 
                      className="w-full h-48 rounded-lg bg-cover bg-center border"
                      style={{ backgroundImage: `url(${customWallpaper})` }}
                    ></div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setWallpaperTheme('custom');
                        document.body.style.background = `url(${customWallpaper}) center/cover fixed`;
                        toast({ title: 'Пользовательский фон применен', description: 'Ваше изображение установлено' });
                      }}
                    >
                      <Icon name="Check" size={16} className="mr-2" />
                      Применить фон
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
                  'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
                  'https://images.unsplash.com/photo-1614850523060-8da1d56ae167?w=800',
                  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
                  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800',
                  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800',
                  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
                  'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800',
                  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
                ].map((url, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg bg-cover bg-center cursor-pointer hover:scale-105 transition-all border-2 hover:border-primary"
                    style={{ backgroundImage: `url(${url})` }}
                    onClick={() => {
                      document.body.style.background = `url(${url}) center/cover fixed`;
                      toast({ title: 'Фон применен', description: `Изображение ${index + 1} установлено` });
                    }}
                  ></div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {activeView === 'mobile' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
          <div className="grid grid-cols-4 gap-1 p-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Home" size={20} className="mb-1" />
              <span className="text-xs font-medium">Главная</span>
            </button>
            <button
              onClick={() => setShowVideoDownloader(true)}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Download" size={20} className="mb-1" />
              <span className="text-xs font-medium">Скачать</span>
            </button>
            <button
              onClick={() => {
                setActiveAddTab('game');
                setShowAddContent(true);
              }}
              className="flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Gamepad2" size={20} className="mb-1" />
              <span className="text-xs font-medium">Игры</span>
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => setShowProfile(true)}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon name="User" size={20} className="mb-1" />
                <span className="text-xs font-medium">Профиль</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex flex-col items-center justify-center py-3 px-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon name="LogIn" size={20} className="mb-1" />
                <span className="text-xs font-medium">Войти</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return <MainContent />;
};

export default Index;