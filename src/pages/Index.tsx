import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; theme: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showVideoDownloader, setShowVideoDownloader] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
  const [showWallpaperSettings, setShowWallpaperSettings] = useState(false);
  const [wallpaperTheme, setWallpaperTheme] = useState<'light' | 'dark' | 'custom'>('light');
  const [customWallpaper, setCustomWallpaper] = useState('');
  const { toast } = useToast();

  const [platforms, setPlatforms] = useState<Platform[]>([
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
    }
  ]);

  const [games, setGames] = useState<Game[]>([
    { id: '1', name: 'Dota 2', platform: 'Steam' },
    { id: '2', name: 'CS:GO', platform: 'Steam' },
    { id: '3', name: 'Valorant', platform: 'PC' },
    { id: '4', name: 'League of Legends', platform: 'PC' }
  ]);

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [newPlatform, setNewPlatform] = useState({ name: '', description: '', type: 'streaming' as const, url: '' });
  const [newGame, setNewGame] = useState({ name: '', platform: '' });

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
    setShowAddPlatform(false);
    toast({ title: 'Платформа добавлена!', description: `${platform.name} успешно добавлена` });
  };

  const handleAddGame = () => {
    const game: Game = {
      id: Date.now().toString(),
      name: newGame.name,
      platform: newGame.platform
    };
    setGames([...games, game]);
    setNewGame({ name: '', platform: '' });
    setShowAddGame(false);
    toast({ title: 'Игра добавлена!', description: `${game.name} успешно добавлена` });
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
        <Card className="w-full max-w-md p-8 animate-scale-in">
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
          <div className="flex items-center justify-center gap-6">
            <Button
              variant={activeView === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setActiveView('desktop')}
              className={`text-white hover:bg-white/20 rounded-2xl w-14 h-14 ${activeView === 'desktop' ? 'bg-cyan-500/30' : ''}`}
            >
              <Icon name="Monitor" size={24} />
            </Button>
            <Button
              variant={activeView === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setActiveView('mobile')}
              className={`text-white hover:bg-white/20 rounded-2xl w-14 h-14 ${activeView === 'mobile' ? 'bg-cyan-500/30' : ''}`}
            >
              <Icon name="Smartphone" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVideoDownloader(true)}
              className="text-white hover:bg-white/20 rounded-2xl w-14 h-14"
            >
              <Icon name="Download" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-white hover:bg-white/20 rounded-2xl w-14 h-14"
            >
              <Icon name="Search" size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWallpaperSettings(true)}
              className="text-white hover:bg-white/20 rounded-2xl w-14 h-14"
            >
              <Icon name="Palette" size={24} />
            </Button>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(true)}
                className="text-white hover:bg-white/20 rounded-2xl w-14 h-14"
              >
                <Icon name="User" size={24} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowAuth(true)}
                className="text-white hover:bg-white/20 rounded-2xl h-14 px-6"
              >
                <Icon name="LogIn" size={20} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-8 ${activeView === 'mobile' ? 'max-w-md' : ''}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📺</span>
              </div>
              <h2 className="text-2xl font-bold">Стриминговые платформы</h2>
            </div>
            <Button onClick={() => setShowAddPlatform(true)} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить платформу
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <h2 className="text-2xl font-bold">Игры</h2>
            </div>
            <Button onClick={() => setShowAddGame(true)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить игру
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
            {games.map((game) => (
              <div key={game.id} className="group relative">
                <Card className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0">
                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <span className="text-3xl">🎮</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{game.name}</h3>
                    <p className="text-xs text-muted-foreground">{game.platform}</p>
                  </div>
                </Card>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => {
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

        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-2xl font-bold">Другие платформы</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-in">
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


      </div>

      <Dialog open={showAddPlatform} onOpenChange={setShowAddPlatform}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить платформу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <Button onClick={handleAddPlatform} className="w-full">Добавить</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddGame} onOpenChange={setShowAddGame}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить игру</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <Button onClick={handleAddGame} className="w-full">Добавить</Button>
          </div>
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
              <h4 className="text-sm font-semibold mb-3">Или откройте напрямую:</h4>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://ru.get-save.com/1-1/" target="_blank" rel="noopener noreferrer">
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Get-Save.com - Универсальный загрузчик
                </a>
              </Button>
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
              onClick={() => setShowAddGame(true)}
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