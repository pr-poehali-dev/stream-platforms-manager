import { Button } from '@/components/ui/button';
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
  const handleSearchClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex gap-2">
      {searchEngines.map((engine) => (
        <Button
          key={engine.id}
          variant="outline"
          size="sm"
          onClick={() => handleSearchClick(engine.url, engine.name)}
          className="flex items-center gap-2"
        >
          <Icon name={engine.icon} size={16} className={engine.color} />
          <span>{engine.name}</span>
        </Button>
      ))}
    </div>
  );
};
