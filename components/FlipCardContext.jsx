'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const FlipCardContext = createContext({
  activeFlippedProductId: null,
  toggleFlip: () => {},
  closeFlip: () => {},
});

export function FlipCardProvider({ children }) {
  const [activeFlippedProductId, setActiveFlippedProductId] = useState(null);
  const pathname = usePathname();

  // Reset flipped card when navigating to another route
  useEffect(() => {
    setActiveFlippedProductId(null);
  }, [pathname]);

  const toggleFlip = useCallback((id) => {
    if (!id) {
      setActiveFlippedProductId(null);
      return;
    }
    setActiveFlippedProductId((prev) => (prev === id ? null : id));
  }, []);

  const closeFlip = useCallback(() => {
    setActiveFlippedProductId(null);
  }, []);

  return (
    <FlipCardContext.Provider value={{ activeFlippedProductId, toggleFlip, closeFlip }}>
      {children}
    </FlipCardContext.Provider>
  );
}

export function useFlipCard() {
  return useContext(FlipCardContext);
}
