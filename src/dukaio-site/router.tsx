/**
 * Petit adaptateur vers react-router-dom v6, pour que les pages du site
 * restent identiques au design validé.
 */
import { createContext, useContext, useEffect, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from "react";
import { Link as RRLink, useLocation, useNavigate as useRRNavigate, useParams } from "react-router-dom";

type Params = Record<string, string>;

export function buildPath(to: string, params?: Params, hash?: string) {
  let p = to.replace(/\$([a-zA-Z_]+)/g, (_, k: string) => encodeURIComponent(params?.[k] ?? ""));
  if (hash) p += `#${hash}`;
  return p;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string; params?: Params; hash?: string; replace?: boolean;
  activeProps?: { className?: string }; children?: ReactNode;
};

export function Link({ to, params, hash, replace, activeProps, className, ...rest }: LinkProps) {
  const { pathname } = useLocation();
  const path = buildPath(to, params);
  const active = activeProps && pathname === path;
  const cls = [className, active ? activeProps?.className : ""].filter(Boolean).join(" ") || undefined;
  return <RRLink to={buildPath(to, params, hash)} replace={replace} className={cls} {...rest} />;
}

export function useNavigate() {
  const nav = useRRNavigate();
  return ({ to, params, replace }: { to: string; params?: Params; replace?: boolean }) => nav(buildPath(to, params), { replace });
}

const NOT_FOUND = Symbol("not-found");
export const notFound = () => NOT_FOUND;

type Meta = { title?: string; name?: string; property?: string; content?: string };
type RouteOpts<T> = {
  loader?: (a: { params: Params }) => T;
  head?: (a: { loaderData?: T }) => { meta: Meta[] };
  component: ComponentType;
};

const DataCtx = createContext<unknown>(undefined);

function applyHead(meta: Meta[]) {
  for (const m of meta) {
    if (m.title) { document.title = m.title; continue; }
    const key = m.name ? "name" : m.property ? "property" : null;
    if (!key || m.content == null) continue;
    const val = (m.name ?? m.property)!;
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${val}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute(key, val); document.head.appendChild(el); }
    el.content = m.content;
  }
}

/** Même forme que TanStack `createFileRoute(path)(options)`. */
export function createFileRoute(_path: string) {
  return function <T>(opts: RouteOpts<T>) {
    function Page({ fallback }: { fallback?: ReactNode }) {
      const params = useParams() as Params;
      let data: T | undefined;
      let missing = false;
      try { data = opts.loader?.({ params }); } catch (e) { if (e === NOT_FOUND) missing = true; else throw e; }
      useEffect(() => { if (!missing && opts.head) applyHead(opts.head({ loaderData: data }).meta); });
      if (missing) return <>{fallback ?? null}</>;
      const C = opts.component;
      return <DataCtx.Provider value={data}><C /></DataCtx.Provider>;
    }
    return { Page, useLoaderData: () => useContext(DataCtx) as T };
  };
}
