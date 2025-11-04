import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FileItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface FilePreviewDialogProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (fileId: string | number) => void;
}

export function FilePreviewDialog({ file, isOpen, onClose, onDelete }: FilePreviewDialogProps) {
  const { toast } = useToast();
  const [deleteTimer, setDeleteTimer] = useState<number | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState<number>(0);
  
  useEffect(() => {
    if (deleteTimer !== null && deleteCountdown > 0) {
      const interval = setInterval(() => {
        setDeleteCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (deleteCountdown === 0 && deleteTimer !== null) {
      if (onDelete) {
        onDelete(file!.id);
        onClose();
      }
      setDeleteTimer(null);
    }
  }, [deleteCountdown, deleteTimer, onDelete, file, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setDeleteTimer(null);
      setDeleteCountdown(0);
    }
  }, [isOpen]);
  
  if (!file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Music';
    if (mimeType.includes('pdf')) return 'FileText';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('compressed')) return 'Archive';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Sheet';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'FileText';
    return 'File';
  };

  const isPreviewable = () => {
    return file.mime_type.startsWith('image/') || 
           file.mime_type.startsWith('video/') || 
           file.mime_type.startsWith('audio/') ||
           file.mime_type === 'application/pdf' ||
           file.mime_type.includes('presentation') ||
           file.mime_type.includes('powerpoint');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(file.file_url, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(file.file_url);
    toast({
      title: 'Ссылка скопирована',
      description: 'Ссылка на файл скопирована в буфер обмена'
    });
  };

  const handleDelete = () => {
    if (deleteTimer !== null) {
      setDeleteTimer(null);
      setDeleteCountdown(0);
      toast({
        title: 'Отменено',
        description: 'Удаление файла отменено'
      });
    } else {
      setDeleteCountdown(4);
      setDeleteTimer(Date.now());
      toast({
        title: 'Удаление запланировано',
        description: 'У вас есть 4 секунды чтобы отменить'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Icon name={getFileIcon(file.mime_type)} size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate">{file.original_filename}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {formatFileSize(file.file_size)} • {file.mime_type}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="flex-shrink-0 w-48 flex flex-col gap-2">
            <Button variant="outline" className="justify-start" onClick={handleDownload}>
              <Icon name="Download" size={16} className="mr-2" />
              Скачать
            </Button>
            <Button 
              variant={deleteTimer !== null ? "default" : "outline"} 
              className={deleteTimer !== null 
                ? "justify-start bg-yellow-600 hover:bg-yellow-700 text-white" 
                : "justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              }
              onClick={handleDelete}
            >
              <Icon name={deleteTimer !== null ? "X" : "Trash2"} size={16} className="mr-2" />
              {deleteTimer !== null ? `Отменить (${deleteCountdown}с)` : 'Удалить'}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {isPreviewable() ? (
              <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                {file.mime_type.startsWith('image/') && (
                  <img 
                    src={file.file_url} 
                    alt={file.original_filename} 
                    className="max-w-full max-h-[500px] object-contain rounded-lg"
                  />
                )}
                {file.mime_type.startsWith('video/') && (
                  <video 
                    controls 
                    autoPlay
                    className="max-w-full max-h-[500px] rounded-lg bg-black"
                    preload="metadata"
                  >
                    <source src={file.file_url} type={file.mime_type} />
                    <source src={file.file_url} />
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                )}
                {file.mime_type.startsWith('audio/') && (
                  <div className="w-full">
                    <audio controls className="w-full">
                      <source src={file.file_url} type={file.mime_type} />
                    </audio>
                  </div>
                )}
                {file.mime_type === 'application/pdf' && (
                  <iframe 
                    src={file.file_url} 
                    className="w-full h-[500px] rounded-lg" 
                    title={file.original_filename} 
                  />
                )}
                {(file.mime_type.includes('presentation') || file.mime_type.includes('powerpoint')) && (
                  <iframe 
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.file_url)}`}
                    className="w-full h-[500px] rounded-lg" 
                    title={file.original_filename}
                  />
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="p-4 rounded-full bg-muted-foreground/10 mb-4">
                  <Icon name={getFileIcon(file.mime_type)} size={64} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Предпросмотр недоступен</h3>
                <p className="text-sm text-muted-foreground">
                  Для этого типа файла предпросмотр не поддерживается
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}