import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useTheme } from '@/components/theme-provider';
import { api, UserProfile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { addLog } from '@/components/activity-log';

interface ProfileSettingsProps {
  onLogout: () => void;
  onAccountDeleted: () => void;
}

export function ProfileSettings({ onLogout, onAccountDeleted }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      addLog('Загружаю данные профиля...', 'info');
      const data = await api.getProfile();
      setProfile(data);
      setDisplayName(data.displayName || '');
      setEmail(data.email);
      addLog('Профиль загружен', 'success');
    } catch (error) {
      addLog('Ошибка загрузки профиля', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      addLog('Загружаю аватар...', 'info');
      const uploadedFile = await api.uploadFile(avatarFile);
      await api.updateProfile({ avatarUrl: uploadedFile.file_url });
      setProfile(prev => prev ? { ...prev, avatarUrl: uploadedFile.file_url } : null);
      setAvatarFile(null);
      addLog('Аватар обновлен', 'success');
      toast({
        title: 'Успешно',
        description: 'Аватар обновлен',
      });
    } catch (error) {
      addLog('Ошибка загрузки аватара', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аватар',
        variant: 'destructive',
      });
    }
  };

  const handleWallpaperUpload = async () => {
    if (!wallpaperFile) return;

    try {
      addLog('Загружаю обои...', 'info');
      const uploadedFile = await api.uploadFile(wallpaperFile);
      await api.updateProfile({ wallpaperUrl: uploadedFile.file_url });
      setProfile(prev => prev ? { ...prev, wallpaperUrl: uploadedFile.file_url } : null);
      setWallpaperFile(null);
      addLog('Обои обновлены', 'success');
      toast({
        title: 'Успешно',
        description: 'Обои обновлены',
      });
    } catch (error) {
      addLog('Ошибка загрузки обоев', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить обои',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      addLog('Обновляю профиль...', 'info');
      await api.updateProfile({ displayName });
      addLog('Профиль обновлен', 'success');
      toast({
        title: 'Успешно',
        description: 'Профиль обновлен',
      });
    } catch (error) {
      addLog('Ошибка обновления профиля', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEmail = async () => {
    try {
      addLog('Обновляю email...', 'info');
      await api.updateProfile({ email });
      addLog('Email обновлен', 'success');
      toast({
        title: 'Успешно',
        description: 'Email обновлен',
      });
    } catch (error) {
      addLog('Ошибка обновления email', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить email',
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    try {
      addLog('Меняю пароль...', 'info');
      await api.updateProfile({ password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addLog('Пароль изменен', 'success');
      toast({
        title: 'Успешно',
        description: 'Пароль изменен',
      });
    } catch (error) {
      addLog('Ошибка смены пароля', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить пароль',
        variant: 'destructive',
      });
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      addLog(`Меняю тему на ${newTheme}...`, 'info');
      setTheme(newTheme);
      await api.updateProfile({ theme: newTheme });
      addLog('Тема изменена', 'success');
    } catch (error) {
      addLog('Ошибка смены темы', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      addLog('Удаляю аккаунт...', 'warning');
      await api.deleteAccount();
      addLog('Аккаунт удален', 'success');
      onAccountDeleted();
    } catch (error) {
      addLog('Ошибка удаления аккаунта', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить аккаунт',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Настройки профиля</h1>
        <Button variant="outline" onClick={onLogout}>
          <Icon name="LogOut" size={16} className="mr-2" />
          Выйти
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
          <TabsTrigger value="danger">Опасная зона</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatarUrl || undefined} />
                <AvatarFallback>
                  {displayName?.charAt(0)?.toUpperCase() || email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar">Аватар</Label>
                <div className="flex gap-2">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  />
                  <Button onClick={handleAvatarUpload} disabled={!avatarFile}>
                    <Icon name="Upload" size={16} className="mr-2" />
                    Загрузить
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Имя</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ваше имя"
              />
            </div>

            <Button onClick={handleUpdateProfile}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <Label>Тема</Label>
              <RadioGroup value={theme} onValueChange={handleThemeChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon name="Sun" size={16} />
                      Светлая
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon name="Moon" size={16} />
                      Темная
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Icon name="Monitor" size={16} />
                      Системная
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallpaper">Обои профиля</Label>
              {profile?.wallpaperUrl && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
                  <img
                    src={profile.wallpaperUrl}
                    alt="Обои"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="wallpaper"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setWallpaperFile(e.target.files?.[0] || null)}
                />
                <Button onClick={handleWallpaperUpload} disabled={!wallpaperFile}>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button onClick={handleUpdateEmail}>
                  <Icon name="Save" size={16} className="mr-2" />
                  Изменить
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">Сменить пароль</h3>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Новый пароль</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword}>
                <Icon name="Key" size={16} className="mr-2" />
                Изменить пароль
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-6">
          <Card className="p-6 border-destructive">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-destructive">Удаление аккаунта</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Это действие необратимо. Все ваши данные, файлы и настройки будут удалены навсегда.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить аккаунт
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Ваш аккаунт и все связанные с ним данные будут удалены навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                      Удалить аккаунт
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
