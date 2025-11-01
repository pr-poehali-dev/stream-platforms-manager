import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { FileItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewDialogProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (fileId: string) => void;
}

export function FilePreviewDialog({ file, isOpen, onClose, onDelete }: FilePreviewDialogProps) {
  const { toast } = useToast();
  
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
           file.mime_type === 'application/pdf';
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
    if (onDelete) {
      onDelete(file.id);
      onClose();
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
            <Button variant="outline" className="justify-start" onClick={handleView}>
              <Icon name="Pencil" size={16} className="mr-2" />
              Изменить
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleView}>
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Открыть в новой вкладке
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleDownload}>
              <Icon name="Download" size={16} className="mr-2" />
              Скачать
            </Button>
            <Button variant="outline" className="justify-start" onClick={handleShare}>
              <Icon name="Share2" size={16} className="mr-2" />
              Поделиться
            </Button>
            <Button variant="outline" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={handleDelete}>
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
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
                  <video controls className="max-w-full max-h-[500px] rounded-lg">
                    <source src={file.file_url} type={file.mime_type} />
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