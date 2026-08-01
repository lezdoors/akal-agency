import { useEffect, useRef, useState } from "react";

export interface InViewOptions {
  /** Ratio (0..1) of the element that must be visible to count as "in view". */
  threshold?: number;
  /** Root margin, e.g. "0px 0px -10% 0px" to delay trigger until partly in. */
  rootMargin?: string;
  /** Fire only once and then unsubscribe. */
  once?: boolean;
}

/**
 * IntersectionObserver-backed visibility flag. Used for lazy-loading clips
 * ~one viewport ahead and for play-when-in-view autoplay.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: InViewOptions = {}
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { threshold = 0.2, rootMargin = "0px", once = false } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const next = entry.isIntersecting;
          setInView(next);
          if (next && once) io.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
