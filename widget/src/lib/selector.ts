/** Hide our shadow host, read the host-page element under a point, then restore. */
export function elementAt(x: number, y: number, hostEl: HTMLElement): Element | null {
  const prev = hostEl.style.visibility;
  hostEl.style.visibility = "hidden";
  const el = document.elementFromPoint(x, y);
  hostEl.style.visibility = prev;
  return el;
}

/** Best-effort CSS path to an element (id wins; else tag + :nth-of-type, depth ≤ 5). */
export function cssPath(el: Element | null): string | undefined {
  if (!el) return undefined;
  const parts: string[] = [];
  let node: Element | null = el;

  while (node && node.nodeType === 1 && parts.length < 5) {
    let sel = node.nodeName.toLowerCase();
    if (node.id) {
      const id = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(node.id) : node.id;
      parts.unshift(`${sel}#${id}`);
      break;
    }
    const parent: HTMLElement | null = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.nodeName === node!.nodeName,
      );
      if (siblings.length > 1) {
        sel += `:nth-of-type(${siblings.indexOf(node) + 1})`;
      }
    }
    parts.unshift(sel);
    node = parent;
  }

  return parts.join(" > ") || undefined;
}
