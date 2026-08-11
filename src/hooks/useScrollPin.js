import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Scroll PINNING, not scroll hijacking, and the distinction is the whole design.
// The wheel is never intercepted and scroll speed is never altered. A section
// sticks to the viewport while the visitor's own scroll drives a timeline
// through it, then releases. Nothing here calls preventDefault, adds a wheel or
// touch listener, or uses scroll-snap: the visitor is always in control and
// their input just drives a timeline instead of translating the page.
//
// Pins are disabled below 1024px, where pinned scrubbing on touch is unreliable
// and unpleasant, and disabled entirely under prefers-reduced-motion. In both
// cases every section renders in its final state as ordinary page flow, because
// the animations only ever move things that are already there.

export const PIN_MIN_WIDTH = 1024;

export function pinsEnabled() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  return window.innerWidth >= PIN_MIN_WIDTH;
}

// Registers one pinned timeline. `build` receives a gsap timeline and the
// trigger element, and should only ever animate transform, opacity of
// decorative layers, or stroke offsets. Never the opacity of text.
export function useScrollPin({ ref, end, build, deps = [], onProgress }) {
  // Layout effect, not an effect. A scrubbed `from` tween writes its start
  // state the moment the timeline is built, so building it after paint shows
  // one frame of the finished graph before it collapses back to the start of
  // the build. Running before paint means the first frame is already correct,
  // and it means nothing is ever set at all for visitors who get no pins.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !pinsEnabled()) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end,
          pin: true,
          // Real scrubbing: progress follows the scrollbar with a short catch-up
          // so it feels weighted rather than glued to the pixel.
          scrub: 1,
          // Fixed CTAs must survive the pin. GSAP's default pinType on a body
          // with transforms can force fixed children into the transformed
          // context; anchoring to the page scroller keeps `position: fixed`
          // meaning what it says.
          pinType: "fixed",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: onProgress ? (self) => onProgress(self.progress) : undefined,
        },
      });
      build?.(timeline, el);
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Anchor navigation has to keep landing correctly with pins active, and pinned
// heights are computed from measured layout, so anything that changes layout
// after first paint has to trigger a recalculation. Fonts are the classic one:
// they load late, reflow every heading, and silently invalidate every pin.
export function useScrollTriggerRefresh() {
  useEffect(() => {
    if (!pinsEnabled()) return;

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);
    // ScrollTrigger handles resize itself, but orientation changes on hybrid
    // devices can cross the 1024px boundary without firing what it listens for.
    window.addEventListener("orientationchange", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("orientationchange", refresh);
    };
  }, []);
}

export { ScrollTrigger, gsap };
