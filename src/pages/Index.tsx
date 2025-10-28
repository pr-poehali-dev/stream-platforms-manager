import { useAuth } from '@/contexts/AuthContext';
import { Auth } from '@/components/Auth';
import { FileManager } from '@/components/FileManager';
import Icon from '@/components/ui/icon';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return isAuthenticated ? <FileManager /> : <Auth />;
};

export default Index;
