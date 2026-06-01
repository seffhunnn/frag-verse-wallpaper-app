import { useState, useEffect } from 'react';

// Breakpoints mirror the Tailwind sm/lg/xl breakpoints used in the app
const BREAKPOINTS = [
  { minWidth: 1280, cols: 5 },
  { minWidth: 1024, cols: 4 },
  { minWidth: 640,  cols: 3 },
  { minWidth: 0,    cols: 2 },
];

const getCols = (width, max) => {
  for (const bp of BREAKPOINTS) {
    if (width >= bp.minWidth) return Math.min(bp.cols, max);
  }
  return 2;
};

/**
 * Returns the current responsive masonry column count.
 * Updates instantly on resize. SSR-safe (defaults to 2).
 *
 * @param {number} max - maximum columns allowed (e.g. 4 for TodaysPicks, 5 for main grid)
 */
const useColumnCount = (max = 5) => {
  const [cols, setCols] = useState(() =>
    typeof window !== 'undefined' ? getCols(window.innerWidth, max) : 2
  );

  useEffect(() => {
    const onResize = () => setCols(getCols(window.innerWidth, max));
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [max]);

  return cols;
};

export default useColumnCount;
