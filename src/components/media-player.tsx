import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface MediaPlayerProps {
  src: string;
  type: string;
  title?: string;
  onClose?: () => void;
}

export function MediaPlayer({ src, type, title, onClose }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;
    const newVolume = value[0];
    media.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold truncate">{title}</h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={18} />
            </Button>
          )}
        </div>
      )}

      <div className="relative bg-black">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            className="w-full max-h-[60vh] object-contain"
            onClick={togglePlay}
          />
        ) : isAudio ? (
          <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
            <Icon 
              name={isPlaying ? 'Music' : 'Music'} 
              size={64} 
              className="text-white opacity-50" 
            />
          </div>
        ) : null}
        
        {isAudio && (
          <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
        )}
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground min-w-[45px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground min-w-[45px] text-right">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipTime(-10)}
              disabled={!duration}
            >
              <Icon name="SkipBack" size={20} />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12"
              onClick={togglePlay}
              disabled={!duration}
            >
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => skipTime(10)}
              disabled={!duration}
            >
              <Icon name="SkipForward" size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div 
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
              >
                <Icon 
                  name={isMuted || volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'} 
                  size={20} 
                />
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-background border rounded-lg shadow-lg">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    orientation="vertical"
                    onValueChange={handleVolumeChange}
                    className="h-24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
