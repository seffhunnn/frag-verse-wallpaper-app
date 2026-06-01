import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchHeroSlideshowWallpapers } from '../services/unsplashApi';

const SLIDE_INTERVAL_MS = 7000;
const FADE_DURATION_MS = 1200;

function preloadImage(url) {
  if (!url) return Promise.reject(new Error('No url'));
  if (preloadImage.cache?.has(url)) return Promise.resolve(url);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      preloadImage.cache?.add(url);
      resolve(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}
preloadImage.cache = new Set();

function pickHeroSrc(slide) {
  return slide?.heroImage || slide?.image || slide?.thumb;
}

export { SLIDE_INTERVAL_MS, FADE_DURATION_MS };

export default function useHeroSlideshow(fallbackSlides = []) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState(0);
  const [layerSlides, setLayerSlides] = useState([null, null]);
  const [bootstrapped, setBootstrapped] = useState(false);

  const transitioningRef = useRef(false);
  const intervalRef = useRef(null);
  const fadeTimeoutRef = useRef(null);
  const slidesRef = useRef([]);
  const currentIndexRef = useRef(0);
  const activeLayerRef = useRef(0);

  slidesRef.current = slides;
  currentIndexRef.current = currentIndex;
  activeLayerRef.current = activeLayer;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let pool = [];
      try {
        const data = await fetchHeroSlideshowWallpapers();
        if (data.length >= 2) pool = data;
      } catch {
        // fallback below
      }

      if (pool.length < 2) {
        const fb = (fallbackSlides || []).filter((s) => pickHeroSrc(s));
        if (fb.length) pool = fb;
      }

      if (cancelled || !pool.length) {
        if (!cancelled) setBootstrapped(true);
        return;
      }

      const firstSrc = pickHeroSrc(pool[0]);
      if (firstSrc) {
        try {
          await preloadImage(firstSrc);
        } catch {
          // continue
        }
      }

      if (pool.length > 1) {
        const secondSrc = pickHeroSrc(pool[1]);
        if (secondSrc) {
          try {
            await preloadImage(secondSrc);
          } catch {
            // continue
          }
        }
      }

      if (cancelled) return;

      setSlides(pool);
      setLayerSlides([pool[0], pool[1] ?? pool[0]]);
      setCurrentIndex(0);
      setActiveLayer(0);
      setBootstrapped(true);
    })();

    return () => { cancelled = true; };
  }, [fallbackSlides]);

  const advanceSlide = useCallback(async () => {
    const list = slidesRef.current;
    if (list.length < 2 || transitioningRef.current) return;

    const nextIndex = (currentIndexRef.current + 1) % list.length;
    const nextSlide = list[nextIndex];
    const nextSrc = pickHeroSrc(nextSlide);

    if (!nextSrc) return;

    transitioningRef.current = true;

    try {
      await preloadImage(nextSrc);
    } catch {
      transitioningRef.current = false;
      setCurrentIndex(nextIndex);
      return;
    }

    const inactiveLayer = 1 - activeLayerRef.current;

    setLayerSlides((prev) => {
      const next = [...prev];
      next[inactiveLayer] = nextSlide;
      return next;
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setActiveLayer(inactiveLayer);
        activeLayerRef.current = inactiveLayer;

        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = window.setTimeout(() => {
          setCurrentIndex(nextIndex);
          currentIndexRef.current = nextIndex;
          transitioningRef.current = false;
        }, FADE_DURATION_MS);
      });
    });
  }, []);

  const advanceRef = useRef(advanceSlide);
  advanceRef.current = advanceSlide;

  useEffect(() => {
    if (slides.length < 2) return undefined;

    intervalRef.current = window.setInterval(() => {
      advanceRef.current();
    }, SLIDE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, [slides.length]);

  useEffect(() => {
    if (!slides.length) return;
    const upcoming = (currentIndex + 1) % slides.length;
    const src = pickHeroSrc(slides[upcoming]);
    if (src) preloadImage(src).catch(() => {});
  }, [currentIndex, slides]);

  const current = slides[currentIndex] ?? layerSlides[activeLayer] ?? null;

  return {
    slides,
    current,
    currentIndex,
    activeLayer,
    layerSlides,
    bootstrapped,
    hasSlides: slides.length > 0,
    fadeDurationMs: FADE_DURATION_MS,
    slideIntervalMs: SLIDE_INTERVAL_MS,
  };
}
