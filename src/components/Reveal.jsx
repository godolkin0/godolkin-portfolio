import { useLayoutEffect, useRef, useState } from "react";

// Fades content up as it scrolls into view.
//
// INVARIANT: nothing on screen at first paint may have its OPACITY gated on an
// event or a running timeline. An IntersectionObserver only delivers callbacks
// during a rendering update, so a page loaded in a hidden or throttled tab
// (session restore, background tab, prerender) never gets that first entry and
// the element sits at opacity 0 forever — that is exactly how the hero once
// shipped invisible. A fill-mode CSS animation has the same failure: a frozen
// timeline holds the from-state indefinitely.
// So we measure on mount, and anything already in the viewport renders fully
// opaque immediately, with a transform-only entrance (.reveal-on-mount in
// index.css). Worst case that leaves a 12px offset — never unreadable text.
// Only genuinely below-the-fold content touches the observer.
//
// Reduced motion starts fully shown; starting hidden would leave content
// invisible once transitions are neutralized.
// `as` lets the wrapper BE the semantic element instead of sitting inside it.
// Wrapping list items in a div put <div> as the direct child of <ol> and left
// every <li> without a list parent, which is invalid markup and reads to a
// screen reader as loose text rather than "step 3 of 7".
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  // "waiting" — hidden, awaiting intersection.
  // "mount"   — above the fold at load, playing the CSS mount animation.
  // "shown"   — final resting state, fully opaque.
  const [state, setState] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "shown"
      : "waiting"
  );

  // Layout effect, not an effect: this runs before paint, so an above-the-fold
  // element is committed opaque on the very first frame with no flash.
  useLayoutEffect(() => {
    if (state !== "waiting") return;
    const el = ref.current;
    if (!el) {
      setState("shown");
      return;
    }

    const rect = el.getBoundingClientRect();
    const onScreenAtLoad = rect.top < window.innerHeight && rect.bottom > 0;
    if (onScreenAtLoad || typeof IntersectionObserver === "undefined") {
      setState("mount");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // Mount-only on purpose: `state` is read for its initial value.
  }, []);

  // Mount mode carries NO transition, deliberately. A `transition-all` on the
  // wrapper turns the opacity-0 -> opacity-100 flip into a CSSTransition, and a
  // transition stalled at currentTime 0 is just another way to render nothing.
  // It also gets no stagger delay: legibility at load beats choreography.
  if (state === "mount") {
    return (
      <Tag ref={ref} className={`translate-y-0 opacity-100 reveal-on-mount ${className}`}>
        {children}
      </Tag>
    );
  }

  const hidden = state === "waiting";
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        hidden ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
