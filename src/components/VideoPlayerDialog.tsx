import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayerDialog({ isOpen, onClose }: VideoPlayerDialogProps) {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const handleLoadVideo = () => {
    if (!videoUrl.trim()) {
      toast({ 
        title: 'Ошибка', 
        description: 'Введите ссылку на видео',
        variant: 'destructive' 
      });
      return;
    }

    setCurrentVideoUrl(videoUrl);
    setUploadedVideoUrl(null);
    toast({ 
      title: 'Видео загружено', 
      description: 'Видео готово к просмотру' 
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({ 
        title: 'Ошибка', 
        description: 'Пожалуйста, выберите видео файл',
        variant: 'destructive' 
      });
      return;
    }

    setUploadedVideo(file);
    const url = URL.createObjectURL(file);
    setUploadedVideoUrl(url);
    setCurrentVideoUrl('');
    toast({ 
      title: 'Видео загружено', 
      description: `${file.name} готово к просмотру` 
    });
  };

  const handleClose = () => {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setVideoUrl('');
    setCurrentVideoUrl('');
    setUploadedVideo(null);
    setUploadedVideoUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Icon name="Play" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            Видеоплеер
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Ссылка на видео</Label>
              <div className="flex gap-2">
                <Input
                  id="video-url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLoadVideo();
                    }
                  }}
                />
                <Button onClick={handleLoadVideo}>
                  <Icon name="Link" size={16} className="mr-2" />
                  Загрузить
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-file">Или загрузите файл</Label>
              <div className="flex gap-2">
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>

          {(currentVideoUrl || uploadedVideoUrl) && (
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
              <video 
                key={currentVideoUrl || uploadedVideoUrl}
                controls 
                className="w-full max-h-[500px] rounded-lg"
                autoPlay
              >
                <source src={uploadedVideoUrl || currentVideoUrl} />
                Ваш браузер не поддерживает воспроизведение видео
              </video>
            </div>
          )}

          {!currentVideoUrl && !uploadedVideoUrl && (
            <div className="bg-muted rounded-lg p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
              <div className="p-4 rounded-full bg-muted-foreground/10 mb-4">
                <Icon name="Video" size={64} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Видео не загружено</h3>
              <p className="text-sm text-muted-foreground">
                Вставьте ссылку на видео или загрузите файл с устройства
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
