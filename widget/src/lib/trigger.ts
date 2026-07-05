/**
 * Wire the host page's own trigger elements: one delegated click listener so
 * `[data-brainbox-trigger]` works on elements rendered at any time (SPAs),
 * on any number of elements, and on clicks landing on nested markup.
 *
 * Clicks inside the widget's shadow tree retarget to the `#brainbox-widget`
 * host, which carries no trigger attribute - the widget can't trigger itself.
 * Returns a cleanup for tests; in prod the widget lives for the page lifetime.
 */
export function installTriggerDelegation(doc: Document, onTrigger: () => void): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("[data-brainbox-trigger]")) {
      onTrigger();
    }
  };
  doc.addEventListener("click", onClick);
  return () => doc.removeEventListener("click", onClick);
}
