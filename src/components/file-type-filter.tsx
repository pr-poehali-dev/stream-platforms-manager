import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

export interface FileType {
  id: string;
  name: string;
  icon: string;
  extensions: string[];
  color: string;
}

export const FILE_TYPES: FileType[] = [
  {
    id: 'folder',
    name: 'Папки',
    icon: 'Folder',
    extensions: [],
    color: 'text-yellow-500',
  },
  {
    id: 'shortcut',
    name: 'Ярлык',
    icon: 'Link',
    extensions: ['.lnk', '.url'],
    color: 'text-blue-400',
  },
  {
    id: 'access',
    name: 'Microsoft Access Database',
    icon: 'Database',
    extensions: ['.accdb', '.mdb'],
    color: 'text-red-600',
  },
  {
    id: 'image',
    name: 'Точечный рисунок',
    icon: 'Image',
    extensions: ['.bmp', '.jpg', '.jpeg', '.png', '.gif', '.webp'],
    color: 'text-green-500',
  },
  {
    id: 'word',
    name: 'Документ Microsoft Word',
    icon: 'FileText',
    extensions: ['.doc', '.docx'],
    color: 'text-blue-600',
  },
  {
    id: 'powerpoint',
    name: 'Презентация Microsoft PowerPoint',
    icon: 'Presentation',
    extensions: ['.ppt', '.pptx'],
    color: 'text-orange-600',
  },
  {
    id: 'publisher',
    name: 'Microsoft Publisher Document',
    icon: 'FileType',
    extensions: ['.pub'],
    color: 'text-emerald-600',
  },
  {
    id: 'text',
    name: 'Текстовый документ',
    icon: 'FileText',
    extensions: ['.txt'],
    color: 'text-gray-500',
  },
  {
    id: 'excel',
    name: 'Лист Microsoft Excel',
    icon: 'Sheet',
    extensions: ['.xls', '.xlsx', '.csv'],
    color: 'text-green-600',
  },
  {
    id: 'zip',
    name: 'Сжатая ZIP-папка',
    icon: 'Archive',
    extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
    color: 'text-purple-500',
  },
  {
    id: 'video',
    name: 'Видео',
    icon: 'Video',
    extensions: ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp', '.ogv', '.ts', '.vob'],
    color: 'text-pink-500',
  },
  {
    id: 'audio',
    name: 'Аудио',
    icon: 'Music',
    extensions: ['.mp3', '.wav', '.flac', '.m4a', '.ogg'],
    color: 'text-indigo-500',
  },
  {
    id: 'pdf',
    name: 'PDF документ',
    icon: 'FileType',
    extensions: ['.pdf'],
    color: 'text-red-500',
  },
];

interface FileTypeFilterProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export function FileTypeFilter({ selectedTypes, onTypesChange }: FileTypeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(id => id !== typeId));
    } else {
      onTypesChange([...selectedTypes, typeId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === FILE_TYPES.length) {
      onTypesChange([]);
    } else {
      onTypesChange(FILE_TYPES.map(type => type.id));
    }
  };

  return (
    <Card className="w-full">
      <div
        className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} />
          <h3 className="font-semibold">Фильтр по типу файлов</h3>
          {selectedTypes.length > 0 && selectedTypes.length < FILE_TYPES.length && (
            <Badge variant="secondary">{selectedTypes.length}</Badge>
          )}
        </div>
        <Icon
          name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
          size={20}
          className="text-muted-foreground"
        />
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary hover:underline"
            >
              {selectedTypes.length === FILE_TYPES.length ? 'Снять все' : 'Выбрать все'}
            </button>
            {selectedTypes.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {selectedTypes.length} из {FILE_TYPES.length}
              </span>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {FILE_TYPES.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`file-type-${type.id}`}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => handleToggleType(type.id)}
                  />
                  <Label
                    htmlFor={`file-type-${type.id}`}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <Icon name={type.icon as any} size={20} className={type.color} />
                    <span className="text-sm">{type.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
}