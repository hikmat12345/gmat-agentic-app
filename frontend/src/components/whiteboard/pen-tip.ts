/**
 * Pen-tip geometry for the roaming tutor orb.
 *
 * Given a whiteboard step, its reveal progress (0→1), and its laid-out
 * bounding box, returns the point the "pen" is currently at — in board /
 * viewBox coordinates (the same space as the SVG `viewBox` and the layout
 * x/y/width/height). The orb is animated to follow this point so it looks
 * like the AI is drawing the diagram.
 *
 * Geometry strokes are traced precisely (they're the primitives that actually
 * animate via `strokeDashoffset`, so the orb lands exactly on the growing
 * stroke). Other diagram types (coordinate planes, number lines, draw_shape)
 * don't have a single canonical stroke path, so the orb sweeps left→right
 * across their bounding box as they reveal — a "drawing" gesture without
 * pretending to trace a specific line.
 */
import type {
  WhiteboardStep,
  GeometryAction,
  GeoFigure,
  LocalPoint,
} from "@/types/whiteboard";

export type LocalVec = { x: number; y: number };

export interface BoardBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BoardPoint = { x: number; y: number };

/**
 * The current step's location, published by the canvas so the resting orb can
 * hover beside the latest content (and re-derive its on-screen position each
 * frame as the board scrolls). `box` is in board/viewBox coords; `svg` + the
 * viewBox dims convert it to client px live.
 */
export interface StepFocus {
  box: BoardBox;
  svg: SVGSVGElement;
  viewBoxWidth: number;
  viewBoxHeight: number;
}

/** Step action types the orb treats as "drawn" diagrams. */
export function isDiagramStep(step: WhiteboardStep | undefined): boolean {
  if (!step) return false;
  const t = step.action.type;
  return (
    t === "geometry" ||
    t === "coordinate_plane" ||
    t === "number_line" ||
    t === "draw_shape"
  );
}

/** Local 0–100 point → board coords within the step's bounding box. */
function toBoard(p: LocalPoint, b: BoardBox): BoardPoint {
  return { x: b.x + (p.x / 100) * b.width, y: b.y + (p.y / 100) * b.height };
}

const CURVE_SEGMENTS = 48;

/**
 * Convert a single geometry figure into a sampled polyline (board coords).
 * Curves are approximated by {@link CURVE_SEGMENTS} segments so a single
 * arc-length sampler works for every figure type. Returns null for figures
 * with no traceable outline.
 */
function figurePolyline(fig: GeoFigure, b: BoardBox): BoardPoint[] | null {
  switch (fig.type) {
    case "polygon": {
      if (!fig.vertices?.length) return null;
      const pts = fig.vertices.map((v) => toBoard(v, b));
      pts.push(pts[0]); // close the loop
      return pts;
    }
    case "line_segment":
      return [toBoard(fig.from, b), toBoard(fig.to, b)];
    case "circle": {
      const c = toBoard(fig.center, b);
      const r = (fig.radius / 100) * Math.min(b.width, b.height);
      return arc(c, r, r);
    }
    case "ellipse": {
      const c = toBoard(fig.center, b);
      return arc(c, (fig.rx / 100) * b.width, (fig.ry / 100) * b.height);
    }
    default:
      return null;
  }
}

/** Sampled points around an ellipse/circle starting at 3 o'clock, clockwise. */
function arc(c: BoardPoint, rx: number, ry: number): BoardPoint[] {
  const pts: BoardPoint[] = [];
  for (let i = 0; i <= CURVE_SEGMENTS; i++) {
    const a = (i / CURVE_SEGMENTS) * 2 * Math.PI;
    pts.push({ x: c.x + rx * Math.cos(a), y: c.y + ry * Math.sin(a) });
  }
  return pts;
}

function polylineLength(pts: BoardPoint[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

/** Point at fraction `t` (0–1) of the polyline's total arc length. */
function sampleAtFraction(pts: BoardPoint[], t: number): BoardPoint {
  if (pts.length === 1) return pts[0];
  const total = polylineLength(pts);
  if (total === 0) return pts[0];
  const target = Math.max(0, Math.min(1, t)) * total;
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + seg >= target) {
      const f = seg === 0 ? 0 : (target - acc) / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f,
      };
    }
    acc += seg;
  }
  return pts[pts.length - 1];
}

/**
 * Per-figure draw schedule: partitions the overall [0,1] progress into one
 * slice per figure, proportional to each figure's stroke length, so the
 * figures draw **sequentially** at a constant pen speed.
 */
const TRAVEL_GAP = 0.18;

export function geometryFigureSchedule(
  figures: GeoFigure[],
  b: BoardBox,
): { start: number; end: number }[] {
  const lens = figures.map((f) => {
    const poly = figurePolyline(f, b);
    return poly ? polylineLength(poly) : 0;
  });
  const traceable = lens.filter((l) => l > 0).length;
  const gaps = Math.max(0, traceable - 1);
  const drawPortion = Math.max(0.1, 1 - gaps * TRAVEL_GAP);
  const total = lens.reduce((a, c) => a + c, 0) || 1;
  let cursor = 0;
  let seen = 0;
  return lens.map((len) => {
    if (len <= 0) return { start: cursor, end: cursor };
    if (seen > 0) cursor += TRAVEL_GAP;
    const slice = drawPortion * (len / total);
    const seg = { start: cursor, end: cursor + slice };
    cursor += slice;
    seen++;
    return seg;
  });
}

/** Trace whichever figure is drawing, gliding across the travel gaps between. */
function geometryPenTip(
  action: GeometryAction,
  progress: number,
  b: BoardBox,
): BoardPoint | null {
  const figs = action.figures ?? [];
  const sched = geometryFigureSchedule(figs, b);
  const items: { seg: { start: number; end: number }; poly: BoardPoint[] }[] = [];
  for (let i = 0; i < figs.length; i++) {
    const seg = sched[i];
    if (!seg || seg.end <= seg.start) continue;
    const poly = figurePolyline(figs[i], b);
    if (poly) items.push({ seg, poly });
  }
  if (!items.length) return null;
  if (progress <= items[0].seg.start) return sampleAtFraction(items[0].poly, 0);

  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    if (progress >= it.seg.start && progress < it.seg.end) {
      const local = (progress - it.seg.start) / (it.seg.end - it.seg.start);
      return sampleAtFraction(it.poly, local);
    }
    if (progress < it.seg.start) {
      const prev = items[k - 1];
      const gs = prev.seg.end;
      const f = it.seg.start > gs ? (progress - gs) / (it.seg.start - gs) : 1;
      const a = sampleAtFraction(prev.poly, 1);
      const c = sampleAtFraction(it.poly, 0);
      const bx = a.x + (c.x - a.x) * f;
      const by = a.y + (c.y - a.y) * f;
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const side = k % 2 === 0 ? 1 : -1;
      const bow = Math.sin(f * Math.PI) * Math.min(0.42 * dist, 110) * side;
      return { x: bx + (-dy / dist) * bow, y: by + (dx / dist) * bow };
    }
  }
  return sampleAtFraction(items[items.length - 1].poly, 1);
}

/**
 * The pen-tip in board/viewBox coords for a diagram step at `progress`, or
 * null if the step isn't a (traceable) diagram.
 */
export function penTipForStep(
  step: WhiteboardStep | undefined,
  progress: number,
  box: BoardBox,
): BoardPoint | null {
  if (!step) return null;
  const action = step.action;
  if (action.type === "geometry") {
    return geometryPenTip(action, progress, box);
  }
  if (
    action.type === "coordinate_plane" ||
    action.type === "number_line" ||
    action.type === "draw_shape"
  ) {
    return {
      x: box.x + Math.max(0, Math.min(1, progress)) * box.width,
      y: box.y + box.height * 0.5,
    };
  }
  return null;
}

/**
 * Board/viewBox point → client (viewport) px, using the live SVG element rect.
 */
export function boardToClient(
  p: BoardPoint,
  svg: SVGSVGElement,
  viewBoxWidth: number,
  viewBoxHeight: number,
): BoardPoint {
  const rect = svg.getBoundingClientRect();
  return {
    x: rect.left + (p.x / viewBoxWidth) * rect.width,
    y: rect.top + (p.y / Math.max(1, viewBoxHeight)) * rect.height,
  };
}

/** Spotlight published by the canvas: pulse point + orb standoff in board coords. */
export interface OrbSpotlight {
  point: BoardPoint;
  anchor: BoardPoint;
  svg: SVGSVGElement;
  viewBoxWidth: number;
  viewBoxHeight: number;
}
