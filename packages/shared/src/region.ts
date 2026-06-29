/** The area the end-user highlighted, in CSS pixels relative to the viewport.
 *  `selector` is a best-effort CSS path to the DOM element under the region
 *  center (silently captured for later AI ticket-writing). */
export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
  selector?: string;
}
