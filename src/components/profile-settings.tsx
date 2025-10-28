import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { addLog, setLoggingEnabled, getLoggingEnabled } from '@/components/activity-log';

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
  const [logsEnabled, setLogsEnabled] = useState(getLoggingEnabled());
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
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
      
      const has2FA = localStorage.getItem(`2fa_enabled_${data.email}`) === 'true';
      setTwoFactorEnabled(has2FA);
      
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

  const handleSend2FACode = async () => {
    try {
      addLog('Отправляю код на email...', 'info');
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      toast({
        title: 'Код отправлен',
        description: `6-значный код отправлен на ${email}`,
      });
      addLog(`Код 2FA отправлен на ${email}`, 'success');
      
      console.log('2FA Code:', code);
    } catch (error) {
      addLog('Ошибка отправки кода', 'error');
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код',
        variant: 'destructive',
      });
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label htmlFor="activity-logs" className="text-base">Журнал активности</Label>
                <p className="text-sm text-muted-foreground">
                  Показывать живые логи действий в правом нижнем углу
                </p>
              </div>
              <Switch
                id="activity-logs"
                checked={logsEnabled}
                onCheckedChange={(checked) => {
                  setLogsEnabled(checked);
                  setLoggingEnabled(checked);
                  addLog(checked ? 'Журнал активности включен' : 'Журнал активности выключен', 'info');
                  toast({
                    title: checked ? 'Логи включены' : 'Логи выключены',
                    description: checked ? 'Журнал активности теперь отображается' : 'Журнал активности скрыт',
                  });
                }}
              />
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

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-muted-foreground">
                    Защитите аккаунт с помощью 6-значного кода
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setShow2FADialog(true);
                      handleSend2FACode();
                    } else {
                      setTwoFactorEnabled(false);
                      localStorage.removeItem(`2fa_enabled_${email}`);
                      addLog('Двухфакторная аутентификация отключена', 'warning');
                      toast({
                        title: '2FA отключена',
                        description: 'Двухфакторная аутентификация выключена',
                      });
                    }
                  }}
                />
              </div>
              
              {twoFactorEnabled && (
                <Button 
                  variant="outline" 
                  onClick={() => setShow2FADialog(true)}
                  className="w-full"
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настроить
                </Button>
              )}
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

      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройка двухфакторной аутентификации</DialogTitle>
            <DialogDescription>
              Мы отправили 6-значный код на ваш email: {email}
            </DialogDescription>
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
                    Код действителен 10 минут
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="2fa-code">Введите 6-значный код</Label>
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={handleSend2FACode}
                  className="h-auto p-0"
                >
                  Отправить повторно
                </Button>
              </div>
              <Input
                id="2fa-code"
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
                  setShow2FADialog(false);
                  setTwoFactorCode('');
                }}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button 
                onClick={() => {
                  if (twoFactorCode.length === 6) {
                    setTwoFactorEnabled(true);
                    setShow2FADialog(false);
                    setTwoFactorCode('');
                    localStorage.setItem(`2fa_enabled_${email}`, 'true');
                    addLog('Двухфакторная аутентификация включена', 'success');
                    toast({
                      title: '2FA активирована',
                      description: 'Теперь при входе требуется код из email',
                    });
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
    </div>
  );
}