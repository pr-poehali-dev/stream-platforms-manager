import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

const searchEngines: SearchEngine[] = [
  {
    id: 'yandex',
    name: 'Яндекс',
    url: 'https://yandex.ru',
    icon: 'Search',
    color: 'text-red-500'
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://google.com',
    icon: 'Globe',
    color: 'text-blue-500'
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://bing.com',
    icon: 'Search',
    color: 'text-green-500'
  }
];

export const SearchMenu = () => {
  const handleSearchClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Icon name="Globe" size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {searchEngines.map((engine) => (
          <DropdownMenuItem 
            key={engine.id}
            onClick={() => handleSearchClick(engine.url)}
          >
            <Icon name={engine.icon} size={16} className={`mr-2 ${engine.color}`} />
            {engine.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};