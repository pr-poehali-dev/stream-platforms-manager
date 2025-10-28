import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useTheme } from 'next-themes';

interface Platform {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  color: string;
  description: string;
}

interface Game {
  id: string;
  name: string;
  icon: string;
  players: string;
  platforms: string[];
}

interface Folder {
  id: string;
  name: string;
  items: string[];
  color: string;
}

const Index = () => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVideoDownloaderOpen, setIsVideoDownloaderOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Favorites', items: ['twitch', 'youtube'], color: 'bg-blue-500' },
    { id: '2', name: 'Work', items: ['discord', 'steam'], color: 'bg-green-500' },
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  const platforms: Platform[] = [
    {
      id: 'twitch',
      name: 'Twitch',
      url: 'https://twitch.tv',
      icon: 'Tv',
      category: 'streaming',
      color: 'bg-purple-500',
      description: 'Live streaming platform for gamers',
    },
    {
      id: 'youtube',
      name: 'YouTube Gaming',
      url: 'https://youtube.com/gaming',
      icon: 'Youtube',
      category: 'streaming',
      color: 'bg-red-500',
      description: 'Gaming videos and live streams',
    },
    {
      id: 'steam',
      name: 'Steam',
      url: 'https://store.steampowered.com',
      icon: 'Gamepad2',
      category: 'gaming',
      color: 'bg-blue-600',
      description: 'Digital game distribution platform',
    },
    {
      id: 'discord',
      name: 'Discord',
      url: 'https://discord.com',
      icon: 'MessageCircle',
      category: 'communication',
      color: 'bg-indigo-500',
      description: 'Voice, video, and text communication',
    },
    {
      id: 'vkplay',
      name: 'VK Play Live',
      url: 'https://live.vkplay.ru',
      icon: 'Radio',
      category: 'streaming',
      color: 'bg-blue-500',
      description: 'Russian live streaming platform',
    },
    {
      id: 'boosty',
      name: 'Boosty',
      url: 'https://boosty.to',
      icon: 'Heart',
      category: 'monetization',
      color: 'bg-orange-500',
      description: 'Content creator monetization',
    },
    {
      id: 'vpn',
      name: 'VPN',
      url: '#',
      icon: 'Shield',
      category: 'security',
      color: 'bg-green-600',
      description: 'Virtual private network services',
    },
  ];

  const games: Game[] = [
    {
      id: 'dota2',
      name: 'Dota 2',
      icon: 'Swords',
      players: '500K+',
      platforms: ['steam', 'twitch', 'youtube'],
    },
    {
      id: 'csgo',
      name: 'CS:GO',
      icon: 'Target',
      players: '1M+',
      platforms: ['steam', 'twitch', 'youtube'],
    },
    {
      id: 'valorant',
      name: 'Valorant',
      icon: 'Crosshair',
      players: '800K+',
      platforms: ['twitch', 'youtube'],
    },
    {
      id: 'lol',
      name: 'League of Legends',
      icon: 'Sword',
      players: '2M+',
      platforms: ['twitch', 'youtube'],
    },
    {
      id: 'fortnite',
      name: 'Fortnite',
      icon: 'Zap',
      players: '3M+',
      platforms: ['twitch', 'youtube'],
    },
    {
      id: 'minecraft',
      name: 'Minecraft',
      icon: 'Box',
      players: '1.5M+',
      platforms: ['twitch', 'youtube'],
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: 'Grid3x3' },
    { id: 'streaming', name: 'Streaming', icon: 'Tv' },
    { id: 'gaming', name: 'Gaming', icon: 'Gamepad2' },
    { id: 'communication', name: 'Communication', icon: 'MessageCircle' },
    { id: 'monetization', name: 'Monetization', icon: 'DollarSign' },
    { id: 'security', name: 'Security', icon: 'Shield' },
  ];

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        platform.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, platforms]);

  const filteredGames = useMemo(() => {
    return games.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, games]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (folderId: string) => {
    if (draggedItem) {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, items: [...new Set([...folder.items, draggedItem])] }
            : folder
        )
      );
      setDraggedItem(null);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-purple-500'];
      setFolders((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newFolderName,
          items: [],
          color: colors[Math.floor(Math.random() * colors.length)],
        },
      ]);
      setNewFolderName('');
    }
  };

  const handleRemoveFromFolder = (folderId: string, itemId: string) => {
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId
          ? { ...folder, items: folder.items.filter((item) => item !== itemId) }
          : folder
      )
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
  };

  const handleDownloadVideo = () => {
    if (videoUrl) {
      // Placeholder for video download functionality
      alert(`Downloading video from: ${videoUrl}`);
      setVideoUrl('');
      setIsVideoDownloaderOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={32} className="text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  StreamHub
                </h1>
              </div>
              <Badge variant="secondary">Pro</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={20} />
              </Button>

              <Dialog open={isVideoDownloaderOpen} onOpenChange={setIsVideoDownloaderOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon name="Download" size={16} className="mr-2" />
                    Video Downloader
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Download Video</DialogTitle>
                    <DialogDescription>
                      Enter a video URL to download from supported platforms
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button onClick={handleDownloadVideo} className="w-full">
                      <Icon name="Download" size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Icon name="User" size={16} className="mr-2" />
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Welcome to StreamHub</DialogTitle>
                    <DialogDescription>
                      Sign in to sync your preferences across devices
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="signin" className="space-y-4">
                      <Input placeholder="Email" type="email" />
                      <Input placeholder="Password" type="password" />
                      <Button className="w-full">Sign In</Button>
                    </TabsContent>
                    <TabsContent value="signup" className="space-y-4">
                      <Input placeholder="Name" />
                      <Input placeholder="Email" type="email" />
                      <Input placeholder="Password" type="password" />
                      <Button className="w-full">Create Account</Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search platforms and games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="shrink-0"
              >
                <Icon name={category.icon as any} size={16} className="mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="folders">Folders</TabsTrigger>
          </TabsList>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlatforms.map((platform) => (
                <Card
                  key={platform.id}
                  className="group hover:shadow-lg transition-all duration-300 cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(platform.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${platform.color} text-white`}>
                        <Icon name={platform.icon as any} size={24} />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(platform.url, '_blank')}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name="ExternalLink" size={16} />
                      </Button>
                    </div>
                    <CardTitle className="text-lg mt-3">{platform.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {platform.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs">
                      {platform.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlatforms.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No platforms found</p>
              </div>
            )}
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <Card key={game.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                          <Icon name={game.icon as any} size={24} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{game.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Icon name="Users" size={14} />
                            <span className="text-xs">{game.players} online</span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {game.platforms.map((platformId) => {
                        const platform = platforms.find((p) => p.id === platformId);
                        return platform ? (
                          <Button
                            key={platformId}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(platform.url, '_blank')}
                            className="gap-2"
                          >
                            <Icon name={platform.icon as any} size={14} />
                            {platform.name}
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Gamepad2" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No games found</p>
              </div>
            )}
          </TabsContent>

          {/* Folders Tab */}
          <TabsContent value="folders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Folder</CardTitle>
                <CardDescription>
                  Drag and drop platforms into folders to organize them
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                />
                <Button onClick={handleCreateFolder}>
                  <Icon name="FolderPlus" size={16} className="mr-2" />
                  Create
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className="border-2 border-dashed transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(folder.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded ${folder.color} text-white`}>
                          <Icon name="Folder" size={20} />
                        </div>
                        <CardTitle className="text-lg">{folder.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="text-destructive"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {folder.items.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Drop platforms here
                        </p>
                      ) : (
                        folder.items.map((itemId) => {
                          const platform = platforms.find((p) => p.id === itemId);
                          return platform ? (
                            <div
                              key={itemId}
                              className="flex items-center justify-between p-2 rounded bg-muted"
                            >
                              <div className="flex items-center gap-2">
                                <Icon name={platform.icon as any} size={16} />
                                <span className="text-sm">{platform.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleRemoveFromFolder(folder.id, itemId)}
                              >
                                <Icon name="X" size={12} />
                              </Button>
                            </div>
                          ) : null;
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {folders.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Folder" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No folders yet. Create one to get started!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>StreamHub - Your unified streaming platform manager</p>
          <p className="mt-2">Made with love for streamers and gamers</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
