import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { FILE_TYPES, FileType } from './file-type-filter';

interface UploadFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

export function UploadFileDialog({ isOpen, onClose, onFileSelected, isUploading }: UploadFileDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(FILE_TYPES.map(t => t.id));
  const [dragActive, setDragActive] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);

  const handleToggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === FILE_TYPES.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(FILE_TYPES.map(type => type.id));
    }
  };

  const getAcceptString = () => {
    if (selectedTypes.length === FILE_TYPES.length || selectedTypes.length === 0) {
      return '*/*';
    }

    const extensions: string[] = [];
    selectedTypes.forEach(typeId => {
      const fileType = FILE_TYPES.find(t => t.id === typeId);
      if (fileType) {
        extensions.push(...fileType.extensions);
      }
    });

    return extensions.join(',');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      e.target.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Загрузить файл</DialogTitle>
            
            <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" disabled={isUploading}>
                  <Icon name="Filter" size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Форматы</h4>
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-primary hover:underline"
                    >
                      {selectedTypes.length === FILE_TYPES.length ? 'Снять все' : 'Все'}
                    </button>
                  </div>

                  <ScrollArea className="h-[300px] pr-3">
                    <div className="space-y-2">
                      {FILE_TYPES.filter(t => t.id !== 'folder' && t.id !== 'shortcut').map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={selectedTypes.includes(type.id)}
                            onCheckedChange={() => handleToggleType(type.id)}
                          />
                          <Label
                            htmlFor={`type-${type.id}`}
                            className="flex items-center gap-2 cursor-pointer flex-1"
                          >
                            <Icon name={type.icon as any} size={16} className={type.color} />
                            <span className="text-sm">{type.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload-dialog"
              accept={getAcceptString()}
              disabled={isUploading || selectedTypes.length === 0}
            />
            
            <label
              htmlFor="file-upload-dialog"
              className={`cursor-pointer ${isUploading || selectedTypes.length === 0 ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-4">
                {isUploading ? (
                  <Icon name="Loader2" size={56} className="text-primary animate-spin" />
                ) : (
                  <Icon name="Upload" size={56} className="text-muted-foreground" />
                )}
                
                <div>
                  <p className="font-semibold text-lg mb-1">
                    {isUploading ? 'Загрузка...' : 'Перетащите файл сюда'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    или нажмите для выбора
                  </p>
                </div>

                {selectedTypes.length > 0 && !isUploading && (
                  <div className="mt-2 flex flex-wrap gap-1 justify-center">
                    {FILE_TYPES.filter(t => selectedTypes.includes(t.id) && t.extensions.length > 0)
                      .slice(0, 6)
                      .map(type => (
                        <span key={type.id} className="text-xs bg-muted px-2 py-1 rounded">
                          {type.extensions[0]}
                        </span>
                      ))}
                    {selectedTypes.length > 6 && (
                      <span className="text-xs text-muted-foreground">
                        +{selectedTypes.length - 6}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </label>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            {selectedTypes.length === 0 
              ? 'Выберите форматы через фильтр'
              : `Разрешено ${selectedTypes.length} типов файлов`
            }
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}