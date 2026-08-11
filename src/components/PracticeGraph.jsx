import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import { LINKS, NEIGHBOURS, NODES, mobileGraph, radiusOf } from "../data/graph.js";

// The practice as a force-directed graph, in the visual language of a knowledge
// graph rather than a chart. It is both an explanation of how the work fits
// together and the primary navigation into Act III.
//
// Rendering: SVG, deliberately. At ~36 nodes canvas buys nothing and costs
// hit-testing, keyboard focus and accessible names — the system nodes are real
// anchors, and that only works in the DOM.
//
// React owns the STRUCTURE; d3 owns the POSITIONS. Positions are written
// straight to the DOM in the tick handler. Sixty setStates a second for 36
// nodes would be the one thing guaranteed to make this feel cheap.

const DESKTOP_VIEW = { w: 1440, h: 860 };
const MOBILE_VIEW = { w: 760, h: 900 };

const ALPHA_DECAY = 0.045;
// A very low target, not zero: the graph keeps breathing without re-simulating
// at full alpha, which would cook a laptop fan for no visual gain.
const DRIFT_ALPHA = 0.005;
// Ticks run synchronously before the first paint. See the invariant below.
const SETTLE_TICKS = 320;
// Rendered size of a node label and of an edge, in CSS pixels, held constant
// across container widths by dividing the view scale back out.
const LABEL_PX = 13;
const EDGE_PX = 0.9;

export function PracticeGraph({ lang = "en", isMobile = false, className = "", onActiveChange }) {
  const view = isMobile ? MOBILE_VIEW : DESKTOP_VIEW;

  // The graph data for this breakpoint. Cloned per mount because d3 mutates
  // nodes in place (x, y, vx, vy) and replaces link endpoints with references.
  const { nodes, links } = useMemo(() => {
    const source = isMobile ? mobileGraph() : { nodes: NODES, links: LINKS };
    return {
      nodes: source.nodes.map((n) => ({ ...n })),
      links: source.links.map((l) => ({ ...l })),
    };
  }, [isMobile]);

  const svgRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const linkRefs = useRef(new Map());
  const labelRefs = useRef(new Map());
  const simRef = useRef(null);

  const [active, setActive] = useState(null);
  // User units per rendered CSS pixel. Everything typographic is divided back
  // out by this, because SVG text scales with the viewBox and a fitted viewBox
  // changes scale with the container: a label sized for a 700px workbench
  // renders as a 27px shout across a 1440px hero, and worse on an ultrawide.
  // Node radii and the graph's own geometry are left to scale — they are the
  // drawing. Type and hairlines are not.
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  // The viewBox is FITTED to the settled layout rather than assumed. A force
  // layout's natural extent depends on node count, link count and every force
  // constant, so any hand-picked box is wrong the moment the graph data is
  // edited — and this graph is meant to be edited. Fitting it means the graph
  // fills its frame at every size, and the force constants stay the specified
  // ones instead of being bent to fill a box.
  const [box, setBox] = useState(null);

  const reduced =
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // --- the simulation --------------------------------------------------------
  useEffect(() => {
    const paint = () => {
      for (const node of nodes) {
        const el = nodeRefs.current.get(node.id);
        if (el) el.setAttribute("transform", `translate(${node.x.toFixed(2)} ${node.y.toFixed(2)})`);
        const label = labelRefs.current.get(node.id);
        if (label) {
          label.setAttribute("x", node.x.toFixed(2));
          // Clearance grows with the type, not with the graph, so the gap under
          // a node stays visually constant at every container width.
          label.setAttribute(
            "y",
            (node.y + radiusOf(node) + 7 + LABEL_PX * scaleRef.current).toFixed(2)
          );
        }
      }
      for (const link of links) {
        const el = linkRefs.current.get(linkKey(link));
        if (!el) continue;
        el.setAttribute("x1", link.source.x.toFixed(2));
        el.setAttribute("y1", link.source.y.toFixed(2));
        el.setAttribute("x2", link.target.x.toFixed(2));
        el.setAttribute("y2", link.target.y.toFixed(2));
      }
    };

    const sim = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links)
          .id((d) => d.id)
          // ~70 for the structural edges, as specified. The system->capability
          // edges get a longer rest length: a system shares capabilities with
          // every other system (six of them touch `logging`), so at a uniform
          // distance the shared capabilities act as a knot that drags all six
          // systems into the middle. Giving those edges room is what separates
          // the two groups and clears the centre.
          .distance((l) => (l.kind === "uses" ? 150 : 70))
          .strength(0.35)
      )
      .force("charge", forceManyBody().strength(-180))
      .force("center", forceCenter(view.w / 2, view.h / 2))
      .force(
        "collide",
        // r + 6 keeps nodes off each other. System nodes reserve far more than
        // that, because a system node is never just a dot: it always carries a
        // visible label. Two systems 25px apart do not overlap, but "Lead
        // Auto-Triage" and "Signal Bot" printed under them certainly do. The
        // label is part of the node's footprint, so the physics has to know it.
        // Every node's footprint includes the label it shows when lit, so the
        // padding is sized for type, not for the dot. Systems reserve most:
        // their labels are permanent and the longest on the field.
        forceCollide().radius((d) => radiusOf(d) + (d.tier === "system" ? 54 : 20))
      )
      // A weak lateral bias on the system nodes only, so the two groups settle
      // as loose clusters instead of interleaving. The graph then previews the
      // same split Act III makes explicit, without anything being pinned.
      .force(
        "group",
        forceX((d) => (d.tier === "system" ? (d.group === "A" ? view.w * 0.22 : view.w * 0.78) : view.w / 2)).strength(
          (d) => (d.tier === "system" ? 0.09 : 0)
        )
      )
      // Vertical pull is stronger than horizontal on purpose. A force layout
      // settles round by default; a hero is wide. Squeezing the field flat is
      // what makes the graph read as a landscape rather than a ball in the
      // middle of the screen, and it costs nothing structurally.
      .force("shapeY", forceY(view.h / 2).strength(isMobile ? 0.02 : 0.09))
      .alphaDecay(ALPHA_DECAY);

    simRef.current = sim;

    // INVARIANT, and it is the same one the reveal animation obeys: a correct,
    // readable layout must exist at FIRST PAINT. Nothing about whether the graph
    // is legible may depend on a timeline that can stall.
    //
    // It can stall, routinely. The simulation is paused whenever the tab is
    // hidden or the graph is off-screen, and both are true on a deep link into
    // a section further down the page, or on a restored background tab. Ticking
    // the layout out lazily meant that in exactly those cases the pause landed
    // before the first tick and every node painted stacked at the origin.
    //
    // So the layout is solved synchronously, here, and painted once. About 8ms
    // for 36 nodes. Motion afterwards is decoration on top of a finished graph,
    // never the thing that produces it.
    sim.stop();
    sim.tick(SETTLE_TICKS);
    paint();

    // Fit the frame to what the physics actually produced. Padding leaves room
    // for the labels, which hang below their node and overhang it sideways.
    const padX = 110;
    const padY = 48;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    setBox({
      x: Math.min(...xs) - padX,
      y: Math.min(...ys) - padY,
      w: Math.max(...xs) - Math.min(...xs) + padX * 2,
      h: Math.max(...ys) - Math.min(...ys) + padY * 2,
    });

    if (reduced) {
      return () => {
        sim.stop();
        simRef.current = null;
      };
    }

    // Gentle drift from the settled layout. Re-heating to full alpha here would
    // throw away the solved positions and make the page look like it is still
    // computing, which is the exact impression this site cannot afford to give.
    sim.on("tick", paint);
    sim.alpha(DRIFT_ALPHA).alphaTarget(DRIFT_ALPHA).restart();

    return () => {
      sim.on("tick", null);
      sim.stop();
      simRef.current = null;
    };
  }, [nodes, links, view.w, view.h, reduced]);

  // --- keep type at a constant rendered size --------------------------------
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !box || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // preserveAspectRatio="meet" fits the box inside the element, so the
      // limiting axis sets the scale.
      const next = Math.max(box.w / rect.width, box.h / rect.height);
      if (Math.abs(next - scaleRef.current) < 0.01) return;
      scaleRef.current = next;
      setScale(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    return () => observer.disconnect();
  }, [box]);

  // Reduced motion paints once and never ticks again, so a resize would leave
  // the labels at their old offsets. Repositioning them is not motion.
  useEffect(() => {
    for (const node of nodes) {
      const label = labelRefs.current.get(node.id);
      if (label && node.x != null) {
        label.setAttribute("y", (node.y + radiusOf(node) + 7 + LABEL_PX * scale).toFixed(2));
      }
    }
  }, [scale, nodes]);

  // --- pause when nobody can see it -----------------------------------------
  // Two independent reasons to stop: the tab is hidden, or the graph has
  // scrolled away. Either one alone is enough to make the ticking pure waste.
  useEffect(() => {
    if (reduced) return;
    const svg = svgRef.current;
    if (!svg) return;

    let onScreen = true;

    const apply = () => {
      const sim = simRef.current;
      if (!sim) return;
      // Safe to stop at any moment: the settled layout is already painted, so
      // pausing costs the drift and nothing else.
      if (document.hidden || !onScreen) sim.stop();
      else sim.alpha(DRIFT_ALPHA).alphaTarget(DRIFT_ALPHA).restart();
    };

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting;
              apply();
            },
            { threshold: 0 }
          )
        : null;
    observer?.observe(svg);
    document.addEventListener("visibilitychange", apply);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, [reduced]);

  // --- highlight -------------------------------------------------------------
  const lit = useMemo(() => {
    if (!active) return null;
    const set = new Set([active]);
    for (const id of NEIGHBOURS.get(active) ?? []) set.add(id);
    return set;
  }, [active]);

  const setActiveNode = useCallback(
    (id) => {
      setActive(id);
      onActiveChange?.(id);
    },
    [onActiveChange]
  );

  // --- drag ------------------------------------------------------------------
  // Pointer events, so mouse and pen share one path. Touch is excluded because
  // dragging a node and scrolling the page are the same gesture on a phone, and
  // the page must always win that fight.
  const dragging = useRef(null);

  const toSvgPoint = useCallback(
    (event) => {
      const svg = svgRef.current;
      if (!svg || !box) return null;
      const rect = svg.getBoundingClientRect();
      // The viewBox is letterboxed by preserveAspectRatio="meet", so map through
      // the rendered scale rather than assuming the box fills the element.
      const scale = Math.min(rect.width / box.w, rect.height / box.h);
      const offsetX = (rect.width - box.w * scale) / 2;
      const offsetY = (rect.height - box.h * scale) / 2;
      return {
        x: (event.clientX - rect.left - offsetX) / scale + box.x,
        y: (event.clientY - rect.top - offsetY) / scale + box.y,
      };
    },
    [box]
  );

  const onPointerDown = useCallback(
    (event, node) => {
      if (isMobile || reduced || event.pointerType === "touch") return;
      const point = toSvgPoint(event);
      if (!point) return;
      dragging.current = { node, moved: false };
      node.fx = point.x;
      node.fy = point.y;
      simRef.current?.alphaTarget(0.25).restart();
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [isMobile, reduced, toSvgPoint]
  );

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragging.current;
      if (!drag) return;
      const point = toSvgPoint(event);
      if (!point) return;
      drag.moved = true;
      drag.node.fx = point.x;
      drag.node.fy = point.y;
    },
    [toSvgPoint]
  );

  const endDrag = useCallback((event) => {
    const drag = dragging.current;
    if (!drag) return;
    dragging.current = null;
    // Release the pin so the physics reclaims the node, which is the whole
    // reason dragging feels like touching something rather than moving a sticker.
    drag.node.fx = null;
    drag.node.fy = null;
    simRef.current?.alphaTarget(DRIFT_ALPHA);
    event?.currentTarget?.releasePointerCapture?.(event.pointerId);
  }, []);

  // A drag that ends on a system node must not also follow its link.
  const swallowClickAfterDrag = useCallback((event) => {
    if (dragging.current?.moved) event.preventDefault();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={box ? `${box.x} ${box.y} ${box.w} ${box.h}` : `0 0 ${view.w} ${view.h}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={(e) => {
        endDrag(e);
        if (!isMobile) setActiveNode(null);
      }}
    >
      <title>
        {lang === "it"
          ? "Grafo dei sistemi Godolkin: sistemi, fasi del flusso e capacità, collegati tra loro."
          : "Graph of the Godolkin practice: systems, workflow stages and capabilities, and how they connect."}
      </title>

      <g>
        {links.map((link) => {
          const key = linkKey(link);
          const isLit =
            lit && lit.has(endpointId(link.source)) && lit.has(endpointId(link.target));
          return (
            <line
              key={key}
              ref={(el) => registerRef(linkRefs, key, el)}
              stroke={isLit ? "var(--color-accent)" : "var(--color-line)"}
              strokeWidth={(isLit ? EDGE_PX * 1.7 : EDGE_PX) * scale}
              opacity={lit ? (isLit ? 1 : 0.25) : 0.75}
              style={{ transition: "stroke 150ms ease, opacity 150ms ease, stroke-width 150ms ease" }}
            />
          );
        })}
      </g>

      <g>
        {nodes.map((node) => {
          const isLit = !lit || lit.has(node.id);
          const isSystem = node.tier === "system";
          const label = node.label[lang] ?? node.label.en;
          // Labels at rest: system nodes only. The nav bar already lists the
          // destinations; printing every node's name again is just clutter.
          const showLabel = lit ? lit.has(node.id) : isSystem;

          const shape = (
            <>
              <circle
                r={radiusOf(node)}
                fill={fillFor(node, lit ? lit.has(node.id) : null)}
                style={{ transition: "fill 150ms ease" }}
              />
              {/* Hit area. A 3px capability dot is not a target anyone can hit. */}
              <circle r={Math.max(radiusOf(node) + 9, 14)} fill="transparent" />
            </>
          );

          const interaction = {
            onPointerEnter: () => {
              if (!isMobile) setActiveNode(node.id);
            },
            onPointerDown: (e) => onPointerDown(e, node),
            style: { cursor: isSystem ? "pointer" : isMobile ? "default" : "grab" },
          };

          return (
            <g key={node.id}>
              {isSystem ? (
                <a
                  href={node.href}
                  ref={(el) => registerRef(nodeRefs, node.id, el)}
                  aria-label={`${label} — ${badgeText(node.badge, lang)}`}
                  onFocus={() => setActiveNode(node.id)}
                  onBlur={() => setActiveNode(null)}
                  onClick={swallowClickAfterDrag}
                  {...interaction}
                >
                  {shape}
                </a>
              ) : (
                <g
                  ref={(el) => registerRef(nodeRefs, node.id, el)}
                  aria-hidden="true"
                  onClick={() => {
                    if (isMobile) setActiveNode(active === node.id ? null : node.id);
                  }}
                  {...interaction}
                >
                  {shape}
                </g>
              )}

              <text
                ref={(el) => registerRef(labelRefs, node.id, el)}
                textAnchor="middle"
                aria-hidden="true"
                pointerEvents="none"
                fill={lit && lit.has(node.id) ? "var(--color-ink)" : "var(--color-muted)"}
                opacity={showLabel ? (lit ? 1 : 0.7) : 0}
                // A page-coloured outline drawn behind the glyphs. The graph is
                // a mesh of hairlines and a label sitting on top of three of
                // them is unreadable at any opacity; this is the cheapest fix
                // and it needs no backing plate to clutter the field.
                stroke="var(--color-bg)"
                strokeWidth={3 * scale}
                paintOrder="stroke"
                strokeLinejoin="round"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: `${LABEL_PX * scale}px`,
                  letterSpacing: "0.01em",
                  transition: "opacity 150ms ease, fill 150ms ease",
                }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function registerRef(store, key, el) {
  if (el) store.current.set(key, el);
  else store.current.delete(key);
}

function endpointId(endpoint) {
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

function linkKey(link) {
  return `${endpointId(link.source)}->${endpointId(link.target)}`;
}

// At rest the three tiers read as three depths of grey. Lit, they go solid
// orange. There is no glow: on white, a bloom turns to mud, and contrast alone
// carries the highlight perfectly well.
function fillFor(node, litState) {
  if (litState === true) return "var(--color-accent)";
  if (litState === false) return "var(--color-line)";
  if (node.tier === "system") return "color-mix(in srgb, var(--color-ink) 60%, transparent)";
  if (node.tier === "stage") return "color-mix(in srgb, var(--color-ink) 45%, transparent)";
  return "var(--color-line)";
}

function badgeText(badge, lang) {
  if (lang !== "it") return badge;
  return { LIVE: "LIVE", REPLAY: "REPLAY", "PRIVATE BUILD": "BUILD PRIVATO" }[badge] ?? badge;
}
