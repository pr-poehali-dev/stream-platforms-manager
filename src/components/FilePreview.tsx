import { useState } from 'react';
import { FileItem } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface FilePreviewProps {
  file: FileItem;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  const handleView = () => {
    window.open(file.file_url, '_blank');
  };

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
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'Archive';
    if (mimeType.includes('presentation')) return 'Presentation';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Icon name={getFileIcon(file.mime_type)} size={24} />
            {file.original_filename}
          </DialogTitle>
          <DialogDescription>
            {formatFileSize(file.file_size)} • {file.mime_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isPreviewable() && (
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[300px]">
              {file.mime_type.startsWith('image/') && (
                <img src={file.file_url} alt={file.original_filename} className="max-w-full max-h-[400px] object-contain" />
              )}
              {file.mime_type.startsWith('video/') && (
                <video controls className="max-w-full max-h-[400px]">
                  <source src={file.file_url} type={file.mime_type} />
                </video>
              )}
              {file.mime_type.startsWith('audio/') && (
                <audio controls className="w-full">
                  <source src={file.file_url} type={file.mime_type} />
                </audio>
              )}
              {file.mime_type === 'application/pdf' && (
                <iframe src={file.file_url} className="w-full h-[400px]" title={file.original_filename} />
              )}
            </div>
          )}

          {!isPreviewable() && (
            <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
              <Icon name={getFileIcon(file.mime_type)} size={64} className="text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Предпросмотр недоступен для этого типа файла</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            {isPreviewable() && (
              <Button variant="outline" onClick={handleView}>
                <Icon name="Eye" size={16} className="mr-2" />
                Открыть в новой вкладке
              </Button>
            )}
            <Button onClick={handleDownload} disabled={isDownloading}>
              <Icon name="Download" size={16} className="mr-2" />
              {isDownloading ? 'Скачивание...' : 'Скачать'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
