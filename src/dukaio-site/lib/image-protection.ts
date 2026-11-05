/** Deterrent for ordinary browser actions, not access control for public assets. */
export function installImageProtection(doc: Document): () => void {
  const blockImageAction = (event: Event) => {
    const target = event.target;
    if (target instanceof Element && target.closest("img, picture, svg, [data-protected-image]")) {
      event.preventDefault();
    }
  };

  doc.addEventListener("contextmenu", blockImageAction, true);
  doc.addEventListener("dragstart", blockImageAction, true);
  return () => {
    doc.removeEventListener("contextmenu", blockImageAction, true);
    doc.removeEventListener("dragstart", blockImageAction, true);
  };
}