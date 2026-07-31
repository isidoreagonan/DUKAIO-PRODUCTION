import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const forceScrollTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const root = document.getElementById("root");
  if (root) root.scrollTop = 0;
};

export const ScrollToTop = () => {
  const { pathname, search, hash, key } = useLocation();

  useLayoutEffect(() => {
    forceScrollTop();

    const raf = requestAnimationFrame(forceScrollTop);
    return () => cancelAnimationFrame(raf);
  }, [pathname, search, hash, key]);

  return null;
};
