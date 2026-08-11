import { useEffect, useState } from "react";

// Reads a media query and keeps up with it. Initialised from a real match
// rather than from `false`, so the first paint is already correct: starting
// wrong and correcting in an effect would render the desktop graph on a phone
// for a frame, which is both a flash and a wasted layout of 36 nodes.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches
  );

  useEffect(() => {
    const list = window.matchMedia?.(query);
    if (!list) return;
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);

  return matches;
}

// Below this width the graph drops its capability tier and the pinned scroll
// sections are disabled. One definition, used by both.
export const MOBILE_QUERY = "(max-width: 767px)";
export const NO_PIN_QUERY = "(max-width: 1023px)";
