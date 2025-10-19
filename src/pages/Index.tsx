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
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ email: string; theme: string } | null>({ email: 'user@streamhub.app', theme: 'system' });
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop');
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
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">StreamHub</h1>
                <p className="text-sm text-purple-200">Управление стримами и играми</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant={activeView === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('desktop')}
                  className="text-white hover:bg-white/10"
                >
                  <Icon name="Monitor" size={16} />
                </Button>
                <Button
                  variant={activeView === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('mobile')}
                  className="text-white hover:bg-white/10"
                >
                  <Icon name="Smartphone" size={16} />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="text-white hover:bg-white/10"
              >
                <Icon name="Search" size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(true)}
                className="text-white hover:bg-white/10"
              >
                <Icon name="User" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={`container mx-auto px-4 py-8 ${activeView === 'mobile' ? 'max-w-md' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Стриминговые платформы</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📺</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{streamingPlatforms.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Всего игр</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
            </div>
            <p className="text-3xl font-bold">{games.length}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Пользовательские игры</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-3xl font-bold">0</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Пользовательские платформы</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-3xl font-bold">0</p>
          </Card>
        </div>

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
              <a 
                key={platform.id} 
                href={platform.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
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
              <Card key={game.id} className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer border-0 group">
                <div className="p-4 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">{game.name}</h3>
                  <p className="text-xs text-muted-foreground">{game.platform}</p>
                </div>
              </Card>
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
              <a 
                key={platform.id} 
                href={platform.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group"
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

            <div className="pt-4 border-t">
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
    </div>
  );

  return <MainContent />;
};

export default Index;