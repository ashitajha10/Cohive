import { useState, useEffect, useCallback } from 'react';

const useFullscreen = (ref) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (ref.current?.requestFullscreen) {
        ref.current.requestFullscreen();
      } else if (ref.current?.mozRequestFullScreen) {
        ref.current.mozRequestFullScreen();
      } else if (ref.current?.webkitRequestFullscreen) {
        ref.current.webkitRequestFullscreen();
      } else if (ref.current?.msRequestFullscreen) {
        ref.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [ref]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
};

export default useFullscreen;
