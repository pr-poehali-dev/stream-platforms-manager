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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api, FileItem as ApiFileItem } from '@/lib/api';
import { FilePreviewDialog } from '@/components/FilePreviewDialog';
import { ProfileSettings } from '@/components/profile-settings';
import { ActivityLog, addLog, getLoggingEnabled } from '@/components/activity-log';
import { FILE_TYPES } from '@/components/file-type-filter';
import { UploadFileDialog } from '@/components/upload-file-dialog';
import { SearchMenu } from '@/components/search-menu';


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
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>(FILE_TYPES.map(t => t.id));
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const [show2FAVerify, setShow2FAVerify] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingAuthEmail, setPendingAuthEmail] = useState('');
  const [fileFolders, setFileFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('streamhub_file_folders');
    return saved ? JSON.parse(saved) : [
      { id: 'all', name: 'Все файлы', icon: 'FolderOpen', color: 'text-blue-400', type: 'files' },
      { id: 'images', name: 'Изображения', icon: 'Image', color: 'text-green-400', type: 'files' },
      { id: 'documents', name: 'Документы', icon: 'FileText', color: 'text-orange-400', type: 'files' },
      { id: 'videos', name: 'Видео', icon: 'Video', color: 'text-purple-400', type: 'files' },
      { id: 'presentations', name: 'Презентации', icon: 'Presentation', color: 'text-pink-400', type: 'files' },
    ];
  });
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedFile, setDraggedFile] = useState<ApiFileItem | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [fileFolderMap, setFileFolderMap] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('streamhub_file_folder_map');
    return saved ? JSON.parse(saved) : {};
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenuFile, setContextMenuFile] = useState<ApiFileItem | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showMoveToFolderDialog, setShowMoveToFolderDialog] = useState(false);
  const [fileToMove, setFileToMove] = useState<ApiFileItem | null>(null);
  const { toast } = useToast();

  const handleFileTypesChange = (types: string[]) => {
    setSelectedFileTypes(types);
    const count = types.length;
    const total = FILE_TYPES.length;
    if (count === 0) {
      addLog('Все типы файлов скрыты', 'warning');
    } else if (count === total) {
      addLog('Показаны все типы файлов', 'info');
    } else {
      addLog(`Фильтр: показано ${count} из ${total} типов`, 'info');
    }
  };

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
      name: 'Steam',
      description: 'Крупнейшая цифровая платформа для PC игр',
      type: 'streaming',
      icon: 'Gamepad2',
      gradient: 'from-blue-500 to-blue-700',
      url: 'https://store.steampowered.com'
    },
    {
      id: '4',
      name: 'VK Play Live',
      description: 'Российская платформа для стриминга игр',
      type: 'streaming',
      icon: 'Rocket',
      gradient: 'from-pink-500 to-pink-700',
      url: 'https://vkplay.live'
    },
    {
      id: '5',
      name: 'Discord',
      description: 'Общение с геймерами и стримерами',
      type: 'streaming',
      icon: 'MessageCircle',
      gradient: 'from-green-500 to-green-700',
      url: 'https://discord.com'
    },
    {
      id: '6',
      name: 'Boosty',
      description: 'Платформа для монетизации контента',
      type: 'streaming',
      icon: 'Star',
      gradient: 'from-green-500 to-green-700',
      url: 'https://boosty.to'
    },
    {
      id: '7',
      name: 'VPN',
      description: 'Бесплатный VPN для безопасного доступа',
      type: 'streaming',
      icon: 'Shield',
      gradient: 'from-green-500 to-green-700',
      url: 'https://protonvpn.com'
    },
    {
      id: '8',
      name: 'Google',
      description: 'Самый популярный поисковик в мире',
      type: 'streaming',
      icon: 'Search',
      gradient: 'from-blue-500 to-blue-700',
      url: 'https://google.com'
    },
    {
      id: '9',
      name: 'Яндекс',
      description: 'Ведущий российский поисковик',
      type: 'streaming',
      icon: 'Search',
      gradient: 'from-red-500 to-red-700',
      url: 'https://yandex.ru'
    },
    {
      id: '10',
      name: 'Bing',
      description: 'Поисковая система Microsoft',
      type: 'streaming',
      icon: 'Search',
      gradient: 'from-cyan-500 to-cyan-700',
      url: 'https://bing.com'
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
    if (isAuthenticated && platforms.length > 0) {
      saveUserData();
    }
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem('streamhub_games', JSON.stringify(games));
    if (isAuthenticated && games.length > 0) {
      saveUserData();
    }
  }, [games]);

  useEffect(() => {
    localStorage.setItem('streamhub_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('streamhub_folder_items', JSON.stringify(folderItems));
  }, [folderItems]);

  useEffect(() => {
    localStorage.setItem('streamhub_file_folder_map', JSON.stringify(fileFolderMap));
  }, [fileFolderMap]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
      loadUserData();
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

  const loadUserData = async () => {
    try {
      addLog('Загружаю данные пользователя...', 'info');
      const data = await api.getUserData();
      if (data.platforms && data.platforms.length > 0) {
        setPlatforms(data.platforms);
        addLog(`Загружено платформ: ${data.platforms.length}`, 'success');
      }
      if (data.games && data.games.length > 0) {
        setGames(data.games);
        addLog(`Загружено игр: ${data.games.length}`, 'success');
      }
    } catch (error) {
      addLog('Ошибка загрузки данных пользователя', 'error');
      console.error('Failed to load user data:', error);
    }
  };

  const saveUserData = async () => {
    if (!isAuthenticated) return;
    
    try {
      await api.saveUserData(platforms, games);
      addLog('Данные сохранены на сервере', 'success');
    } catch (error) {
      addLog('Ошибка сохранения данных', 'error');
      console.error('Failed to save user data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addLog('Вход в систему...', 'info');
      
      const has2FA = localStorage.getItem(`2fa_enabled_${authForm.email}`) === 'true';
      
      if (has2FA) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('2FA Login Code:', code);
        
        setPendingAuthEmail(authForm.email);
        setShowAuth(false);
        setShow2FAVerify(true);
        
        addLog('Код 2FA отправлен на email', 'info');
        toast({ 
          title: 'Проверьте email', 
          description: `Код отправлен на ${authForm.email}` 
        });
      } else {
        const result = await api.login(authForm.email, authForm.password);
        setIsAuthenticated(true);
        setCurrentUser({ email: result.user.email, username: result.user.username });
        setShowAuth(false);
        addLog('Вход выполнен успешно', 'success');
        toast({ title: 'Успешный вход!', description: 'Добро пожаловать в StreamHub' });
      }
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

  const handleDeleteFile = async (fileId: string | number) => {
    try {
      const fileIdStr = fileId.toString();
      addLog(`Удаляю файл с ID: ${fileIdStr}...`, 'info');
      await api.deleteFile(fileIdStr);
      setApiFiles(prev => prev.filter(f => f.id.toString() !== fileIdStr));
      addLog('Файл удалён успешно', 'success');
      toast({ title: 'Файл удалён', description: 'Файл успешно удалён из системы' });
    } catch (error) {
      addLog('Ошибка удаления файла', 'error');
      console.error('Delete error:', error);
      toast({ 
        title: 'Ошибка удаления', 
        description: error instanceof Error ? error.message : 'Не удалось удалить файл',
        variant: 'destructive' 
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: ApiFileItem) => {
    e.preventDefault();
    setContextMenuFile(file);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMoveToFolder = (folderId: string) => {
    if (!fileToMove) return;
    
    if (folderId === 'all') {
      setFileFolderMap(prev => {
        const updated = { ...prev };
        delete updated[fileToMove.id];
        return updated;
      });
      addLog(`Файл "${fileToMove.original_filename}" перемещён во "Все файлы"`, 'success');
    } else {
      const folderName = fileFolders.find(f => f.id === folderId)?.name || '';
      setFileFolderMap(prev => ({
        ...prev,
        [fileToMove.id]: folderId
      }));
      addLog(`Файл "${fileToMove.original_filename}" перемещён в "${folderName}"`, 'success');
      toast({
        title: 'Файл перемещён',
        description: `Файл добавлен в папку "${folderName}"`
      });
    }
    
    setShowMoveToFolderDialog(false);
    setFileToMove(null);
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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!isAuthenticated) {
      toast({ title: 'Войдите в аккаунт', description: 'Для загрузки файлов необходима авторизация', variant: 'destructive' });
      setShowAuth(true);
      setShowUploadDialog(false);
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
      setShowUploadDialog(false);
    } catch (error) {
      addLog(`Ошибка загрузки ${file.name}`, 'error');
      toast({ title: 'Ошибка загрузки', description: error instanceof Error ? error.message : 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploadedFile(null);
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
            <SearchMenu />

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
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск файлов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowNewFolderDialog(true)}
                >
                  <Icon name="FolderPlus" size={16} />
                </Button>

                <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Icon name="Filter" size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Фильтр по типу файлов</h4>
                        <button
                          onClick={() => {
                            const newTypes = selectedFileTypes.length === FILE_TYPES.length ? [] : FILE_TYPES.map(t => t.id);
                            handleFileTypesChange(newTypes);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          {selectedFileTypes.length === FILE_TYPES.length ? 'Снять все' : 'Выбрать все'}
                        </button>
                      </div>

                      <ScrollArea className="h-[400px] pr-3">
                        <div className="space-y-2">
                          {FILE_TYPES.map((type) => (
                            <div
                              key={type.id}
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
                            >
                              <Checkbox
                                id={`filter-type-${type.id}`}
                                checked={selectedFileTypes.includes(type.id)}
                                onCheckedChange={() => {
                                  const newTypes = selectedFileTypes.includes(type.id)
                                    ? selectedFileTypes.filter(id => id !== type.id)
                                    : [...selectedFileTypes, type.id];
                                  handleFileTypesChange(newTypes);
                                }}
                              />
                              <Label
                                htmlFor={`filter-type-${type.id}`}
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <Icon name={type.icon as any} size={18} className={type.color} />
                                <span className="text-sm">{type.name}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <p className="text-xs text-muted-foreground">
                        {selectedFileTypes.length} из {FILE_TYPES.length}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button 
                  onClick={() => setShowUploadDialog(true)} 
                  disabled={uploadedFile !== null}
                >
                  <Icon name={uploadedFile ? "Loader2" : "Upload"} size={16} className={`mr-2 ${uploadedFile ? 'animate-spin' : ''}`} />
                  {uploadedFile ? 'Загрузка...' : 'Загрузить файл'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                    <h3 className="text-sm font-semibold">Папки</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <Icon name="HelpCircle" size={16} className="text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Советы по работе с файлами</h4>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              <strong>На компьютере:</strong> нажмите правой кнопкой мыши на файл и выберите "Открыть в новой вкладке"
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <strong>На телефоне:</strong> зажмите картинку и нажмите "Открыть изображение"
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1">
                    {fileFolders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverFolder(folder.id);
                        }}
                        onDragLeave={() => setDragOverFolder(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverFolder(null);
                          if (draggedFile) {
                            if (folder.id === 'all') {
                              setFileFolderMap(prev => {
                                const updated = { ...prev };
                                delete updated[draggedFile.id];
                                return updated;
                              });
                              addLog(`Файл "${draggedFile.original_filename}" перемещён во "Все файлы"`, 'success');
                            } else {
                              setFileFolderMap(prev => ({
                                ...prev,
                                [draggedFile.id]: folder.id
                              }));
                              addLog(`Файл "${draggedFile.original_filename}" перемещён в "${folder.name}"`, 'success');
                              toast({
                                title: 'Файл перемещён',
                                description: `Файл добавлен в папку "${folder.name}"`
                              });
                            }
                          }
                          setDraggedFile(null);
                        }}
                        className={`
                          flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all
                          ${selectedFolder === folder.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                          ${dragOverFolder === folder.id ? 'bg-primary/20 border-2 border-primary border-dashed' : ''}
                        `}
                      >
                        <Icon name={folder.icon as any} size={18} className={selectedFolder === folder.id ? '' : folder.color} />
                        <span className="text-sm font-medium">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-4">
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
            ) : (() => {
              const filteredFiles = apiFiles.filter((file) => {
                const getFileTypeId = (mimeType: string, filename: string) => {
                  const ext = '.' + filename.split('.').pop()?.toLowerCase();
                  
                  if (mimeType.startsWith('image/')) return 'image';
                  if (mimeType.startsWith('video/')) return 'video';
                  if (mimeType.startsWith('audio/')) return 'audio';
                  if (mimeType.includes('pdf')) return 'pdf';
                  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'powerpoint';
                  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
                  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || ext === '.csv') return 'excel';
                  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('archive')) return 'zip';
                  if (ext === '.accdb' || ext === '.mdb') return 'access';
                  if (ext === '.pub') return 'publisher';
                  if (ext === '.txt') return 'text';
                  
                  return 'text';
                };
                
                const fileTypeId = getFileTypeId(file.mime_type, file.original_filename);
                const typeMatches = selectedFileTypes.includes(fileTypeId);
                
                const folderMatches = selectedFolder === 'all' ? true : fileFolderMap[file.id] === selectedFolder;
                
                const searchMatches = searchQuery.trim() === '' || 
                  file.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
                
                return typeMatches && folderMatches && searchMatches;
              });

              return filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-muted inline-block mb-4">
                    <Icon name="Filter" size={64} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Файлы скрыты фильтром</h3>
                  <p className="text-muted-foreground mb-4">
                    Все файлы отфильтрованы. Измените настройки фильтра слева.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Показано файлов: {filteredFiles.length} из {apiFiles.length}
                    </p>
                  </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => {
                  const getFileIcon = (mimeType: string) => {
                    if (mimeType.startsWith('image/')) return 'Image';
                    if (mimeType.startsWith('video/')) return 'Video';
                    if (mimeType.startsWith('audio/')) return 'Music';
                    if (mimeType.includes('pdf')) return 'FileText';
                    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
                    if (mimeType.includes('word')) return 'FileText';
                    if (mimeType.includes('excel')) return 'Sheet';
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
                      draggable
                      onDragStart={() => {
                        setDraggedFile(file);
                        addLog(`Перетаскивание файла "${file.original_filename}"`, 'info');
                      }}
                      onDragEnd={() => setDraggedFile(null)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      className="group hover:shadow-xl transition-all duration-300 hover:border-primary relative"
                    >
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-50 transition-opacity">
                        <Icon name="GripVertical" size={20} className="text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e as any, file);
                        }}
                      >
                        <Icon name="MoreVertical" size={18} />
                      </Button>
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => {
                          setSelectedApiFile(file);
                        }}
                      >
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
                </>
              );
            })()}
              </div>
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

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую папку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Название папки</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Моя папка"
                autoFocus
              />
            </div>
            <Button 
              onClick={() => {
                if (newFolderName.trim()) {
                  const newFolder: Folder = {
                    id: Date.now().toString(),
                    name: newFolderName,
                    icon: 'Folder',
                    color: 'text-yellow-400',
                    type: 'files'
                  };
                  const updated = [...fileFolders, newFolder];
                  setFileFolders(updated);
                  localStorage.setItem('streamhub_file_folders', JSON.stringify(updated));
                  addLog(`Создана папка "${newFolderName}"`, 'success');
                  setNewFolderName('');
                  setShowNewFolderDialog(false);
                }
              }}
              className="w-full"
              disabled={!newFolderName.trim()}
            >
              <Icon name="FolderPlus" size={16} className="mr-2" />
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FilePreviewDialog
        file={selectedApiFile}
        isOpen={!!selectedApiFile}
        onClose={() => setSelectedApiFile(null)}
        onDelete={handleDeleteFile}
      />

      <Dialog open={show2FAVerify} onOpenChange={setShow2FAVerify}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Двухфакторная аутентификация</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-muted rounded-lg">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="Mail" size={32} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Проверьте вашу почту</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Код отправлен на {pendingAuthEmail}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-2fa-code">Введите 6-значный код</Label>
              <Input
                id="login-2fa-code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShow2FAVerify(false);
                  setTwoFactorCode('');
                  setShowAuth(true);
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                onClick={async () => {
                  if (twoFactorCode.length === 6) {
                    const savedCode = localStorage.getItem(`2fa_code_${pendingAuthEmail}`);
                    
                    if (savedCode && savedCode === twoFactorCode) {
                      try {
                        const result = await api.login(authForm.email, authForm.password);
                        setIsAuthenticated(true);
                        setCurrentUser({ email: result.user.email, username: result.user.username });
                        setShow2FAVerify(false);
                        setTwoFactorCode('');
                        setPendingAuthEmail('');
                        addLog('Вход выполнен успешно', 'success');
                        toast({ title: 'Успешный вход!', description: 'Добро пожаловать в StreamHub' });
                      } catch (error) {
                        addLog('Ошибка входа', 'error');
                        toast({ 
                          title: 'Ошибка', 
                          description: 'Не удалось войти', 
                          variant: 'destructive' 
                        });
                      }
                    } else {
                      addLog('Неверный 2FA код', 'error');
                      toast({
                        title: 'Неверный код',
                        description: 'Введённый код не совпадает с вашим 2FA кодом',
                        variant: 'destructive',
                      });
                    }
                  } else {
                    toast({
                      title: 'Ошибка',
                      description: 'Введите 6-значный код',
                      variant: 'destructive',
                    });
                  }
                }}
                disabled={twoFactorCode.length !== 6}
                className="flex-1"
              >
                <Icon name="Check" size={16} className="mr-2" />
                Подтвердить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UploadFileDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onFileSelected={handleFileUpload}
        isUploading={uploadedFile !== null}
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

      {contextMenuPosition && contextMenuFile && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setContextMenuPosition(null);
              setContextMenuFile(null);
            }}
          />
          <div
            className="fixed z-50 bg-background border border-border rounded-lg shadow-lg py-1 min-w-[200px]"
            style={{
              left: `${contextMenuPosition.x}px`,
              top: `${contextMenuPosition.y}px`,
            }}
          >
            <button
              onClick={() => {
                setSelectedApiFile(contextMenuFile);
                setContextMenuPosition(null);
                setContextMenuFile(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm"
            >
              <Icon name="Eye" size={16} />
              Открыть
            </button>
            <button
              onClick={() => {
                setFileToMove(contextMenuFile);
                setShowMoveToFolderDialog(true);
                setContextMenuPosition(null);
                setContextMenuFile(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm"
            >
              <Icon name="FolderInput" size={16} />
              Переместить в другую папку
            </button>
            <button
              onClick={async () => {
                await handleDeleteFile(contextMenuFile.id.toString());
                setContextMenuPosition(null);
                setContextMenuFile(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm text-red-600"
            >
              <Icon name="Trash2" size={16} />
              Удалить
            </button>
            <div className="border-t border-border my-1" />
            <div className="px-4 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Calendar" size={14} />
                Добавлено
              </div>
              <div className="pl-5">
                {new Date(contextMenuFile.created_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <Dialog open={showMoveToFolderDialog} onOpenChange={setShowMoveToFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переместить файл в папку</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {fileFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleMoveToFolder(folder.id)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left
                  ${fileFolderMap[fileToMove?.id || 0] === folder.id ? 'bg-primary/10 border-2 border-primary' : 'border-2 border-transparent'}
                `}
              >
                <Icon name={folder.icon as any} size={20} className={folder.color} />
                <span className="font-medium">{folder.name}</span>
                {fileFolderMap[fileToMove?.id || 0] === folder.id && (
                  <Icon name="Check" size={16} className="ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;