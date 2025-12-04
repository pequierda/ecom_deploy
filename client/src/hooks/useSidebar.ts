// hooks/useSidebar.ts
import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true); // Keep open on desktop
      } else {
        setIsOpen(false); // Close on mobile
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    setIsOpen,
    toggleSidebar,
  };
};